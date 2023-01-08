interface JwtAccessTokenPayload {
  accessLevel: 'read' | 'write';
  walletPublicAddress: string;
  nftContractAddress: string;
  nftId: string;
}

export default JwtAccessTokenPayload;
