import ArweaveSigner from "arseeding-arbundles/src/signing/chains/ArweaveSigner";
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder';
import axios from "axios";
import * as crypto from "crypto";
import express from 'express';
import fileUpload, { UploadedFile } from "express-fileupload";
import { getItemMeta } from 'arseeding-js';
import { ARSEEDING_URL } from "./constants";

export const paramMissingError = 'One or more of the required parameters was missing.';

type AlgoList = {
  [key: string]: {
    keyLength: number,
    ivLength: number,
  }
}

export const algoList: AlgoList = {
  'des': {
    keyLength: 8,
    ivLength: 8,
  }
}

// Types
type Params = {
  algo: string;
  key: string;
  salt: string;
};

type CryptFileFunction = (
  file: UploadedFile,
  decrypt: boolean,
  body: Params
) => Buffer;

type ArseedOrder = {
  itemId: string,
  size: number,
  bundler: string,
  currency: string,
  decimals: number,
  fee: string,
  paymentExpiredTime: number,
  expectedBlock: number
}

// File encryption using parameters and salt
const cryptFileWithSalt: CryptFileFunction = (
  file,
  decrypt = false,
  {
    algo = "aes-256-ctr",
    key = crypto.randomBytes(16).toString("hex"),
    salt = crypto.randomBytes(8).toString("hex"),
  }
): Buffer => {
  if (!decrypt) {
    const cipher = crypto.createCipheriv(algo, key, salt);
    const crypted = Buffer.concat([cipher.update(file.data), cipher.final()]);
    return crypted;
  } else {
    const cipher = crypto.createDecipheriv(algo, key, salt);
    const decrypted = Buffer.concat([cipher.update(file.data), cipher.final()]);
    return decrypted;
  }
};


// Checks if the file exists
const checkFile = (files: fileUpload.FileArray | undefined): boolean => {
  if (!files || !files.file) {
    return false;
  } else return true;
};

// Checks if every needed parametes exist
const checkParams = ({ algo, key, salt }: Params): boolean => {
  if (!algo || !key || !salt) {
    return false;
  }
  const chosenAlgo = algoList[algo]
  if (!chosenAlgo || key.length !== chosenAlgo.keyLength || salt.length !== chosenAlgo.ivLength) {
    return false
  }
  else return true;
};

// Set proper headers for the response
const setupHeaders = (res: express.Response, file?: UploadedFile | undefined) => {
  if (file) {
    res.writeHead(200, {
      'Content-Type': file.mimetype,
      'Content-disposition': 'attachment;filename=' + 'encrypted_' + file.name,
      'Connection': 'close',
    })
  } else {
    res.writeHead(200, {
      'Connection': 'close'
    })
  }
}

const listFilesByBucket = async ({chainsafeBucketUrl} : {chainsafeBucketUrl: string}): Promise<{data:any, error:any}> => {
  try {
    const resp = await axios({
      method: 'post',
      url: `${chainsafeBucketUrl}/ls`,
      headers: {
        'Authorization': `Bearer ${process.env.CHAINSAFE_KEY_SECRET}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        "path": `/`
      })
    });
    return {data: resp.data, error: undefined};
  } catch (error) {
    return {data: undefined, error: error};
  }
};

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max);
}

const getTmpAccessArseedFile = async (): Promise<ArseedOrder> => {
  // This is a very bad practice: you should not put your keys in open. But since this is just for the demo, its fine here!
  const wallet = {
    kty: "RSA",
    n: "nNyQHFS3CvFbi6Sq9R7JzX-jaE0ORpin6UUyTOb16hacOJoNbvxJLbVYbvXV1qYSzVavIeLxB_qTaVQiQcjY7hUcrUcTzCPkJ1ZZwg8JJ0qaKZRgfRBn6vqrsUYIP7F6ZPpqJrwee6rWNUmsI3pTW-hfxqPGE0t3B7VIY52L59vfEmA6_tBaI9CmrNPQKJvFzcfIVaYdjMJqxJjHrFjxyDI9CmGJwhQKgiM7Zv4U7VzELL7lpM_CWZcLpC0mcVa7gzQVk_TYD_siJAF28-8YHOtoEuBmXKbK7DViGUk8mkVeLrUKl9eUfrREdCeiL5ABK8kXS5WPfYYGw3nXbvqV6TznSSyyrvrDyMsJQgMg_KmSqJKDDU-zprP2TPlF2E8uNx37qnLTbUcQrPXeNk7WzLJsV1Tl1kySf5H1QxBxZg_FaOgPbbONUv8NjVVpSuDLu5DTpaG1xO8RivC1o4S6Y_NNCoegOgum1E84zChd51-o2UcMqHDfzS5xIHiWshVm3-vhnJihkwMJlX7DL2YuGZZ-TgIlaaG0nZ8EEaoEkG-JWN40x_HGN_5_UD-jkQFLMGjAPMR7FHYFhzp3XcFBtmBMZoetqWBO5cwPnTMzD29TDMsPuk-vVUln-v30azI9fgr2_wnWFjQz5dOsiPaeydsauifG2Vg4tZLYNw8cY-s",
    e: "AQAB",
    d: "HMgXpSsiHt7kVj4TpEBO9Obbm9KvsOJnxNSOgy_JpXcamQQjPN8Lqlhg7pMq9mSohIbIQaZ7ZWRj0eq_EmUA8MZs6ZpmFonrXhBpDcNmgZAds01nWus8tg_imvdnohA1jfuoqIzR5w0Umth2vle-ndmIYVFBkd7B62cm7ihFOHjOeHexu3mNYI7zVjjTM_BJHhXvO0_skhxGLOZ_lK8JRht5ucLl3PeCahh-2Mn8GwVvdWpdhp0cYwXk--3Q5PDuHQfcgbZmQqBoxkSCiAWx3fSPtw73mT59c1PkORGIDiJ2QomzdOL4ezsmaE2xY5q_rEIMhTDfEEAcU5eyoMlX4hdhFlrqjtPnhUJ4mgv7QmYTzqXamv-lgTWbonvnjZi2fcCOMPR2w0CoJYfIJIAT26AScJknx4fqH9GY7oG303lKt35nkVy5uPh93mLF0MLU7JrqMv7T_seYd_kzW1A6_arfZMaLp4yMj8uDqtt2Yv04JwJbbwkYICXxrBTK0GV_GMpRtkzrZSkb8CENgmwhVrvsIEHDjtEMtpPKF9aI0n9WsnKNYK5z1pjCaujN8I0pMQ9FO7iht0PME2_SGdmihoZnuhy9rAezGFXgImiqUBBaiJZ65z5eMYchIc39X1qjvGUCZuwDH01d4AN17oUIWCZeDRVe7llyIUt9Jp4RWEE",
    p: "ykWAKtsyHqylMMFD3_0OAT6lltkbh7Iz26T7J1svjxXHhJzzSMq9qUzve2A6i-HLJsuANPjtcJ31HyiSp0OBQYBVN8QujtEDESyGxTf1rg9EVKGek76DzBPCvAVKCD6TtZVI0leYxNmHglXSujXFzzF9mSYMjRt8L6zOyYCJjYpEcf1s-XBf_YF6gy9i_p4ec1lgQ7DnWNWImkysaK7YbjC9VFV_8K6T__MuK-9ZR5ze9SV4cxudUPeykDNePawomkujwAn7LwVNm1TZFTn2hTy1nSGkjIYQ172eween5LDvigW3U73Xk4RxFIYv-iZ2rEPVCqh8J7bw3fXcVpifCw",
    q: "xoct-xLePznLRlzuGCCf1qt-cfCl90GoxIA9ErK-X9Mm1RY3NBadcqVbVnpmoKcjJBPJW_6xTS1oy-Y2Xlt9nZPvlHfJxWbX6y3A9LcJm8hg17G9-AnTp_py6Gy5jQo9KI4k6oSvJxQ6QYpXJEHsel2CKK-szZ91woBoHNVfNyp_Yxn4V5qT-3BHKFWf4CtqLM_7WZeEVjVU6tCRKTi-aOmyT_29ppplf5nUN-t0e1-hIFvAbMM03Hj-ldaJg8oBpp4eNL__6buIScFhgsLQ8YaTyfJOXS18G5nyqPBw9Paz6fGvoqK5B2ajvt_L3MCY3jFHRKxYoChL223WZ7PaoQ",
    dp: "FMyOwFlnzvWrytaktxybWw9pEZjjltGBOZ2-Ya6jtk_kA0PsVFjcpdMOcR5VBttB-4xDc68BI2pqsTiH1AFCAk1C9ggLTY46hYKRnSgC8FILkbRIzSJzBQInLRRSJ4TfxXVDVrXBNMS1hXZzw8gRvht1sdDSy5O-8lwPq3K3MkG8hggsM34VsMimo2S1Bj-WHABdwLgpId5bPJqTw_Put231mf1suYAKIfCMl-H1yUJdPtIKj7OQOqotx1ww3aCdUDhk7zNXi988urM_20npiovSlQTHmdeTVcvezkuW3RJAn221CzxjNX0R761Ys51O6KnU91KZ6a-LFxfX_2OUPw",
    dq: "HlaECU09102eqbcDz34UzvpQDVtoEVvgTX8HVjcobn5W_dMyRmx6TQ3F4nY7_qrr7NR1PfCy6YdZ72bTwiGbFZyIzRhtJhRsRI0uYnciKcM6QVvxGtltlcrpCmmrBUmeRPdL3ua92Wv25xMb8_d7CswFWvBVqOqIVVvIDTfyH_0HkH5kfAasPI1Q4nILR3d69zQlRfCokX_-5Q9QT4tTVbb4v86Xz8DiZ9h7HLyHhV78wXQj-Lrv9g0rYnxxcUlKbUrWdNsuYWp-Dj9WBmR9B5u4M_EqVoTf5VvmQDjWGiklH0gGvgS938qolT-f6LEp6zJ-oJjxxi_CP9sOG7TZYQ",
    qi: "EHhx3TLzPxTk87fkQRQq7RLo7cUMC0x_RjKaynr9hlFQSgry-7GN78leiD6s82GtrdpLkgOD4Ziql0fL46IhugMLcQusnyUk8wnuAmLFuJqDe3jHBAqtymHviUvKdMXiHK6IN9GTWierb7xt6GsadRWZhyrWHprGjR6TrGBpOApoJZXqsdZXnd7AHmB_lnyDn1vLln_pnWeQ5TZrhnD0NPnA67ko7zpOrYMXO70W2zqIvW1EJJ-YK-aBRU-Rapj8PwLJELmuJgVk3CtwuQRzwHd8oDFsMZR3I-EjuDVwaxNNX6o1oHgHBC0GyBDFi2C5oBALLEHnUqwFH2M9snmGHA"
  };
  const signer = new ArweaveSigner(wallet);
  const data = Buffer.from(`${Date.now()}`);
  const ops = {
    tags: [
        { name: 'key01', value: 'val01' },
        { name: 'Content-Type', value: 'text/plain' }
    ]
  };
  const currency = 'VRT'
  const cfg =  {
      signer: signer,
      path:"",
      arseedUrl: ARSEEDING_URL,
      currency: currency
  }
  const order: ArseedOrder = await createAndSubmitItem( data, ops, cfg);
  return order;
}

const isTtlFileUriRigged = async (ttlFileUri: string): Promise<boolean> => {
  const itemId = ttlFileUri.split(`${ARSEEDING_URL}/`)[1];
  const order = await getItemMeta(ARSEEDING_URL,itemId);
  return order.owner !== process.env.ARWEAVE_OWNER
}

export { cryptFileWithSalt, checkFile, checkParams, setupHeaders, listFilesByBucket, getRandomInt, getTmpAccessArseedFile, isTtlFileUriRigged };
