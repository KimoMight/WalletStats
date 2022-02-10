import Moralis from "moralis/node";

export const moralisData = {
  serverUrl: process.env.REACT_APP_SERVER_URL,
  appId: process.env.REACT_APP_APP_ID,
};

export async function moralisStartAndGetTransactions(authorization) {
  let serverUrl = moralisData.serverUrl;
  let appId = moralisData.appId;
  Moralis.start({ serverUrl, appId });
  const transactions = await Moralis.Web3API.account.getTransactions({
    chain: "polygon",
    address: authorization,
  });
  const balance = await Moralis.Web3API.account.getNativeBalance({
    chain: "polygon",
    address: authorization,
  });
  return { transactions: transactions, balance: balance };
}

const moralisCon = {
  moralisData,
  moralisStartAndGetTransactions,
};

export default moralisCon;
