import axios from 'axios';

const getAlias = async (address) => {
  return await axios.post(`${process.env.NEXT_PUBLIC_BURN_GATEWAY_PUBLIC_KEY_API}/GetObjectByKey`, {
    objectId: `\u0000GCUP\u0000${address.replace('0x', '').replace('eth|', '')}\u0000`,
  });
};

export default async function handler(req, res) {
  const { wallet } = req.query;
  const apiKey = process.env.ALCHEMY_API_KEY_2;

  if (!wallet) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  // Define contract addresses
  const contractAddresses = [
    "0x04942f6e50086a371c66d51710b0cc5eea91cf37",
    "0xcb35c72f0dcd375544c97ba5fe171d72903bbfdc",
    "0x25e3b2dd160aa1d2c6cb78f34bfd08566e4f5b06",
    "0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c" // ERC-1155 contract
  ];

  const erc1155Contract = "0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c";
  const specificTokenIds = {
    "271205046435987955380309562123119264530432": "https://i2.seadn.io/ethereum/0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c/1656a5aa645d02c24840e5d1ab788344.gif?w=1000",
    "274948152472118278478406682804868714856448": "https://i2.seadn.io/ethereum/0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c/5194c431572bab55d0cf5d7b1857f2a2.webp?w=1000"
  };

  try {
    // Get user's alias
    const aliasResponse = await getAlias(wallet);
    let galaWallet = aliasResponse.data.Data.alias;
    let ethWallet = '0x' + aliasResponse.data.Data.ethAddress;

    console.log(`Gala Wallet: ${galaWallet}`);
    console.log(`ETH Wallet: ${ethWallet}`);

    const responses = await Promise.all(
      contractAddresses.map(async (contract) => {
        const response = await axios.get(
          `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner`,
          {
            params: {
              owner: ethWallet,
              contractAddresses: [contract],
              withMetadata: true,
            },
            headers: {
              "Referer": "http://localhost:3000",
              "Origin": "http://localhost:3000"
            }
          }
        );

        let filteredNFTs = response.data.ownedNfts.map(nft => ({
          ...nft,
          metadata: {
            ...nft.metadata,
            attributes: nft.metadata?.attributes?.length > 0
              ? nft.metadata.attributes
              : [{ trait_type: "Accessory", value: "Wearable" }]
          },
          totalGamesPlayed: 0,
          totalPointsEarned: 0,
        }));

        // ✅ Handle ERC-1155 separately - Check ownership using getOwnersForToken
        if (contract === erc1155Contract) {
          const ownedERC1155 = await Promise.all(
            Object.keys(specificTokenIds).map(async (tokenId) => {
              try {
                // Get list of owners for the ERC-1155 token
                const ownerResponse = await axios.get(
                  `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getOwnersForToken`,
                  {
                    params: {
                      contractAddress: erc1155Contract,
                      tokenId: tokenId,
                    },
                    headers: {
                      "Referer": "http://localhost:3000",
                      "Origin": "http://localhost:3000"
                    }
                  }
                );

                // Check if the user's ETH wallet is in the list of owners
                const isOwner = ownerResponse.data.owners.includes(ethWallet.toLowerCase());

                if (isOwner) {
                  console.log(`✅ User owns ERC-1155 Token ID: ${tokenId}`);

                  // Fetch metadata for the token
                  const metadataResponse = await axios.get(
                    `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTMetadata`,
                    {
                      params: {
                        contractAddress: erc1155Contract,
                        tokenId: tokenId,
                        tokenType: "erc1155",
                        withMetadata: true,
                      },
                      headers: {
                        "Referer": "http://localhost:3000",
                        "Origin": "http://localhost:3000"
                      }
                    }
                  );

                  return {
                    contract: { address: erc1155Contract },
                    id: { tokenId: tokenId },
                    metadata: {
                      ...metadataResponse.data.metadata,
                      image_url: specificTokenIds[tokenId], // Use predefined GIF/WebP
                      attributes: [{ trait_type: "Category", value: "Accessory" }]
                    },
                    totalGamesPlayed: 0,
                    totalPointsEarned: 0,
                  };
                } else {
                  console.log(`❌ User does NOT own ERC-1155 Token ID: ${tokenId}`);
                  return null;
                }
              } catch (err) {
                console.log(`❌ Error checking ownership for ${tokenId}:`, err.response?.data || err.message);
                return null;
              }
            })
          );

          filteredNFTs = ownedERC1155.filter(nft => nft !== null);
        }

        console.log(`Filtered NFTs for contract ${contract}:`, filteredNFTs);
        return filteredNFTs;
      })
    );

    const allNFTs = responses.flat();

    console.log(`Final NFT List:`, allNFTs);

    res.status(200).json({ nfts: allNFTs });
  } catch (error) {
    console.error("Error fetching NFTs:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to fetch NFTs" });
  }
}
