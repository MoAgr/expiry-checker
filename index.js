import { createRequire } from "module";
import HttpProvider from "web3-providers-http";
import sha3 from "js-sha3";
import { arrayify } from "@ethersproject/bytes";

const require = createRequire(import.meta.url);
const { Web3 } = require("web3");
const ARBBaseRegistrarContract = require("./ARBBaseRegistrarContract.json");
const BNBBaseRegistrarContract = require("./BNBBaseRegistrarContract.json");
const ENSBaseRegistrarContract = require("./ENSBaseRegistrarContract.json");

// Replace later with Infura endpoints for each chain,and add to env
const ETH_URL = "https://eth.drpc.org";
const BNB_URL = "https://bsc.drpc.org";
const ARB_URL = "https://arbitrum.drpc.org";

const web3Eth = new Web3(new HttpProvider(ETH_URL));
const web3Bnb = new Web3(new HttpProvider(BNB_URL));
const web3Arb = new Web3(new HttpProvider(ARB_URL));

// Maybe add this to env
const contracts = {
  eth_base_registrar: {
    address: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
    abi: ENSBaseRegistrarContract.abi,
  },
  bnb_base_registrar: {
    address: "0xE3b1D32e43Ce8d658368e2CBFF95D57Ef39Be8a6",
    abi: BNBBaseRegistrarContract.abi,
  },
  arb_base_registrar: {
    address: "0x5d482D501b369F5bA034DEC5c5fb7A50d2D6Ca20",
    abi: ARBBaseRegistrarContract.abi,
  },
};

function keccak256(data) {
  return "0x" + sha3.keccak_256(arrayify(data));
}

function sanitizedDomainNames(domains) {
  return domains.map((domainName) => {
    let sanitizedDomainName = domainName;
    if (
      domainName.endsWith(".eth") ||
      domainName.endsWith(".arb") ||
      domainName.endsWith(".bnb")
    ) {
      sanitizedDomainName = domainName.substring(0, domainName.length - 4);
    }
    sanitizedDomainName = sanitizedDomainName.replace(/\./g, "");
    sanitizedDomainName = sanitizedDomainName.replace(/\s/g, "");
    return sanitizedDomainName;
  });
}

const generate256BitKeccakHash = async (domainName) => {
  return keccak256(
    Buffer.from(sanitizedDomainNames([domainName])[0])
  ).toString();
};

async function readData(domainName) {
  try {
    const ethContract = new web3Eth.eth.Contract(
      contracts.eth_base_registrar.abi,
      contracts.eth_base_registrar.address
    );
    const bnbContract = new web3Bnb.eth.Contract(
      contracts.bnb_base_registrar.abi,
      contracts.bnb_base_registrar.address
    );
    const arbContract = new web3Arb.eth.Contract(
      contracts.arb_base_registrar.abi,
      contracts.arb_base_registrar.address
    );

    const keccak256Hash = await generate256BitKeccakHash(domainName);
    let result;

    if (domainName.endsWith(".eth")) {
      result = await ethContract.methods.nameExpires(keccak256Hash).call();
    } else if (domainName.endsWith(".arb")) {
      result = await arbContract.methods.nameExpires(keccak256Hash).call();
    } else if (domainName.endsWith(".bnb")) {
      result = await bnbContract.methods.nameExpires(keccak256Hash).call();
    } else {
      console.log("Enter a valid domain.");
      return;
    }

    console.log("Expires on:", result);
  } catch (error) {
    console.error("Error reading data:", error);
  }
}

readData("mohit.eth");
