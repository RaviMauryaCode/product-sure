require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.17",
		settings: { optimizer: { enabled: true, runs: 200 } },
	},
	paths: {
		artifacts: "./src/artifacts",
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},
		polygon_mumbai: {
			url: `https://rpc.ankr.com/polygon_mumbai`,
			accounts: [
				"0xdfde011c550ed05a33bc4130bb355e2f7875a0bd2dfce4ac7c2ace5bd0a3d354",
			],
			allowUnlimitedContractSize: true,
		},
		scroll_alpha: {
			url: `https://alpha-rpc.scroll.io/l2`,
			chainId: 534353,
			accounts: [
				"0x225546c2d681f91ee603aeca9f32b1c5eda0758187f5cb7e6d5d9b4774a00ade",
			],
			allowUnlimitedContractSize: true,
		}
	},
};
