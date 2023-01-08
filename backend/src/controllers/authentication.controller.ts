import AuthNft, { getContractDetails, GetTokenResponseSuccess } from './authentication.service';
import axios, { ResponseType } from 'axios';
import FormData from 'form-data';
import express from 'express';
import { UploadedFile } from 'express-fileupload';

import Controller from '../interfaces/controller.interface';

import readAuthMiddleware from '../middleware/readAuth.middleware';
import writeAuthMiddleware from '../middleware/writeAuth.middleware';

import {
  checkFile,
  checkParams,
  setupHeaders,
  cryptFileWithSalt,
  listFilesByBucket,
  getRandomInt,
  getTmpAccessArseedFile,
  isTtlFileUriRigged,
} from "../utils";

import {
  ARSEEDING_URL,
  deployedContractAbi,
  deployedContractAddress,
  networkEndpoint,
} from '../constants';
import { uniqueNamesGenerator, Config, starWars, languages, colors, adjectives  } from 'unique-names-generator';
import { Readable } from 'stream';

class AuthenticationController implements Controller {
  public router = express.Router();
  public authnft = AuthNft();
  public _ = this.authnft.init({
    secret: process.env.JWT_SECRET ?? '',
    networkEndpoint,
    deployedContractAddress,
    deployedContractAbi,
  });

  public CHAINSAFE_BUCKET_URL = process.env.CHAINSAFE_BUCKET_URL ?? '';
  public CHAINSAFE_NFT_ART_BUCKET_URL = process.env.CHAINSAFE_NFT_ART_BUCKET_URL ?? '';
  public CHAINSAFE_NFT_TOKEN_URI_BUCKET_URL = process.env.CHAINSAFE_NFT_TOKEN_URI_BUCKET_URL ?? '';
  public CHAINSAFE_TXN_BUCKET_URL = process.env.CHAINSAFE_TXN_BUCKET_URL ?? '';
  public CHAINSAFE_KEY_SECRET = process.env.CHAINSAFE_KEY_SECRET ?? '';
  public ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? '';
  public ENCRYPTION_SALT = process.env.ENCRYPTION_SALT ?? '';
  public ENCRYPTION_ALGO = process.env.ENCRYPTION_ALGO ?? '';
  public SELF_API_URL = process.env.SELF_API_URL ?? '';

  public nameGeneratorConfig: Config = {
    dictionaries: [ adjectives, colors, languages, starWars ],
    separator: ' ',
    style: 'capital'
  }

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/`, this.displayWelcomeMessage);
    this.router.post(`/token`, this.getAccessToken);
    this.router.delete(`/token`, this.removeAccessToken);
    this.router.post('/encrypt', this.encryptFile);
    this.router.post('/decrypt', this.decryptFile);
    this.router.post('/upload', writeAuthMiddleware, this.uploadFile);
    this.router.post('/upload-txn', readAuthMiddleware /** Not safe, just a hack */, this.uploadTxn);
    this.router.post('/download', readAuthMiddleware, this.downloadFile);
    this.router.post('/delete', writeAuthMiddleware, this.deleteFile);
    this.router.post('/list', readAuthMiddleware, this.listFiles); 
    this.router.get('/contract/:nftContractAddress', this.getContractDetails); 
    this.router.get('/token-uri/', this.generateTokenUri); 
  }

  private displayWelcomeMessage = async (
    _: express.Request,
    response: express.Response,
  ): Promise<void> => {
    response.send(`Welcome to the Dappstar backend server! Directly calling me isn't fun; so head to https://dappstar.vercel.app/ to explore more 🚀`);
  }

  private getAccessToken = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { nonce, signature, walletPublicAddress, nftContractAddress, nftId, ttlFileUri } =
      request.body;
    const res = await axios.get(`${ttlFileUri}`);
    if (!(res.data && res.status === 200)) {
      response.status(400).send('Temporary access expired');
      return;
    }
    if (await isTtlFileUriRigged(ttlFileUri)) {
      response.status(400).send(`Bad ttlFileUri ${ttlFileUri}`);
      return;
    }
    const tokenResponse = await this.authnft.getToken({
      nonce,
      signature,
      walletPublicAddress,
      nftContractAddress,
      nftId,
    });
    if (tokenResponse.code === 200) {
      const data = tokenResponse.data as GetTokenResponseSuccess;
      response
        .cookie('Authorization', data.accessToken, { sameSite: 'none', secure: true, httpOnly: true })
        .send(tokenResponse.data);
      return;
    }
    response.status(tokenResponse.code).send(tokenResponse.data);
  };

  private removeAccessToken = async (
    _: express.Request,
    response: express.Response
  ) => {
    response.cookie('Authorization', 'none', {
        sameSite: 'none',
        secure: true,
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    response.status(200).json({ success: true, message: 'User logged out successfully' })
}

  private encryptFile = async (
    req : express.Request,
    res: express.Response
  ) => {
    if (!req.files || !checkFile(req.files)) {
      return res.status(400).end("Please upload correct file");
    }
    if (!checkParams(req.body)) {
      return res.status(400).end("Please provide correct parameters");
    }
    const file: UploadedFile = req.files.file as UploadedFile;
    const encrypted = cryptFileWithSalt(file, false, req.body);
    setupHeaders(res, file);
    res.end(encrypted);
  };

  private decryptFile = async (
    req : express.Request,
    res: express.Response
  ) => {
    if (!req.files || !checkFile(req.files)) {
      return res.status(400).end("Please upload correct file");
    }
    if (!checkParams(req.body)) {
      return res.status(400).end("Please provide correct parameters");
    }
    const file: UploadedFile = req.files.file as UploadedFile;
    const decrypted = cryptFileWithSalt(file, true, req.body);
    setupHeaders(res, file);
    res.end(decrypted);
  };

  private uploadFile = async (
    req : express.Request,
    res: express.Response
  ) => {
    try {
      if (!req.files || !checkFile(req.files)) {
        return res.status(400).end("Please upload correct file");
      }
      const uploadedFile = req.files.file as UploadedFile;
      // res.send()
      let formdata = new FormData();
      formdata.append('key', this.ENCRYPTION_KEY);
      formdata.append('salt', this.ENCRYPTION_SALT);
      formdata.append('algo', this.ENCRYPTION_ALGO);
      formdata.append('file', uploadedFile.data);
  
      const resp = await axios({
        method: 'post',
        url: `${this.SELF_API_URL}/encrypt`,
        responseType: 'stream' as ResponseType,
        headers: { 
          ...formdata.getHeaders()
        },
        data : formdata
      });

      let formdata2 = new FormData();
      formdata2.append('path', ``);
      formdata2.append('file', resp.data, `encrypted_${uploadedFile.name}`);
  
      const resp2 = await axios({
        method: 'post',
        url: `${this.CHAINSAFE_BUCKET_URL}/upload`,
        responseType: 'stream' as ResponseType,
        headers: { 
          'Authorization': `Bearer ${this.CHAINSAFE_KEY_SECRET}`,
          'Content-Type': 'application/json'
        },
        data : formdata2
      });
  
      resp2.data.pipe(res)
    } catch (error) {
      // console.log(error)
      return res.sendStatus(400);
    }
  };

  private uploadTxn = async (
    req : express.Request,
    res: express.Response
  ) => {
    try {
      const { senderAddress, amount } = req.body;
      let formdata = new FormData();
      formdata.append('path', ``);
      formdata.append('file', '', `${senderAddress}-${amount}`);
      const resp = await axios({
        method: 'post',
        url: `${this.CHAINSAFE_TXN_BUCKET_URL}/upload`,
        responseType: 'stream' as ResponseType,
        headers: { 
          'Authorization': `Bearer ${this.CHAINSAFE_KEY_SECRET}`,
          'Content-Type': 'application/json'
        },
        data : formdata
      });
  
      resp.data.pipe(res)
    } catch (error) {
      return res.sendStatus(400);
    }
  }
  
  private downloadFile = async (
    req : express.Request,
    res: express.Response
  ) => {
    try{
      const { filename } = req.body;
      
      const resp = await axios({
        method: 'post',
        url: `${this.CHAINSAFE_BUCKET_URL}/download`,
        responseType: 'stream' as ResponseType,
        headers: { 
          'Authorization': `Bearer ${this.CHAINSAFE_KEY_SECRET}`,
          'Content-Type': 'application/json'
        },
        data : JSON.stringify({
          "path": `${filename}`
        })
      });
      
      let formdata = new FormData();
      formdata.append('key', this.ENCRYPTION_KEY);
      formdata.append('salt', this.ENCRYPTION_SALT);
      formdata.append('algo', this.ENCRYPTION_ALGO);
      formdata.append('file', resp.data);

      const resp2 = await axios({
        method: 'post',
        url: `${this.SELF_API_URL}/decrypt`,
        responseType: 'stream' as ResponseType,
        headers: { 
          ...formdata.getHeaders()
        },
        data : formdata
      })
      resp2.data.pipe(res)
    } catch (error) {
      return res.sendStatus(400);
    }
  };
  
  private deleteFile = async (
    req : express.Request,
    res: express.Response
  ) => {
    try {
      const { filename } = req.body;
      const resp = await axios({
        method: 'post',
        url: `${this.CHAINSAFE_BUCKET_URL}/rm`,
        headers: {
          'Authorization': `Bearer ${process.env.CHAINSAFE_KEY_SECRET}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          "paths": [
            filename
          ]
        })
      });
      return res.send(resp.data);
    } catch (error) {
      return res.sendStatus(400);
    }
  };

  
  private listFiles = async (
    req : express.Request,
    res: express.Response
  ) => {
    const {data, error} = await listFilesByBucket({chainsafeBucketUrl: this.CHAINSAFE_BUCKET_URL});
    if (error) {
      res.sendStatus(400);
      return;
    }
    res.send(data);
  };

  private getContractDetails = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { nftContractAddress } = request.params;
    return response.send(await getContractDetails({nftContractAddress}));
  };

  private generateTokenUri = async (
    _: express.Request,
    response: express.Response
  ) => {
    const title: string = uniqueNamesGenerator(this.nameGeneratorConfig);
    const description = `Proud owner of Taylor's utility NFT!`;
    const arseedFileId = await getTmpAccessArseedFile();
    const ttlFileUri = `${ARSEEDING_URL}/${arseedFileId.itemId}`;
    const {data, error} = await listFilesByBucket({chainsafeBucketUrl: this.CHAINSAFE_NFT_ART_BUCKET_URL});
    if (error) {
      response.sendStatus(400);
      return;
    }
    const files = data as any[];
    const randomFile = files[getRandomInt(files.length)] ?? files[0];
    if (!randomFile || !randomFile.cid) {
      response.sendStatus(400);
      return;
    }
    const stream = Readable.from(JSON.stringify({
      title,
      description,
      image: `https://ipfs.io/ipfs/${randomFile.cid}`,
      ttlFileUri
    }));
    const filename = `token_uri_${Date.now()}.json`;
    let formdata = new FormData();
    formdata.append('path', ``);
    formdata.append('file', stream, filename);
  
    await axios({
      method: 'post',
      url: `${this.CHAINSAFE_NFT_TOKEN_URI_BUCKET_URL}/upload`,
      responseType: 'stream' as ResponseType,
      headers: { 
        'Authorization': `Bearer ${this.CHAINSAFE_KEY_SECRET}`,
        'Content-Type': 'application/json'
      },
      data : formdata
    });

    const resp = await axios({
      method: 'post',
      url: `${this.CHAINSAFE_NFT_TOKEN_URI_BUCKET_URL}/file`,
      headers: { 
        'Authorization': `Bearer ${this.CHAINSAFE_KEY_SECRET}`,
        'Content-Type': 'application/json'
      },
      data : JSON.stringify({
        "path": `${filename}`
      })
    });

    const cid = resp.data?.content?.cid;
    if (!cid) {
      response.sendStatus(400);
      return;
    }
    response.send({tokenUri: `https://ipfs.io/ipfs/${cid}`, ttlFileUri});
  };
}

export default AuthenticationController;
