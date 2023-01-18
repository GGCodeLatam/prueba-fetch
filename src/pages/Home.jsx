import React, { useEffect, useState } from 'react';
import { Metaplex } from '@metaplex-foundation/js';
import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider("https://polygon-mainnet.infura.io/v3/3bd86219011c4d06868db44236d48610"));
const connection = web3;
const mx = Metaplex.make(connection);

function Home() {
  const [address, setAddress] = useState(
    'EAqjUWVX2m9fdfGNBzTY5zSiid1Sb9V3x6EL8ssZBTkw',
  );

  const [nftList, setNftList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState(null);
  const perPage = 1;
  const account = web3.eth.accounts.privateKeyToAccount(address);
  const owner = account.address;

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setCurrentView(null);
      const list = await mx.nfts().findAllByOwner({ owner });
      setNftList(list);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!nftList) {
      return;
    }

    const execute = async () => {
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = currentPage * perPage;
      const nfts = await loadData(startIndex, endIndex);

      setCurrentView(nfts);
      setLoading(false);
    };

    execute();
  }, [nftList, currentPage]);

  const loadData = async (startIndex, endIndex) => {
    const nftsToLoad = nftList.filter((_, index) => (index >= startIndex && index < endIndex))

    const promises = nftsToLoad.map((metadata) => mx.nfts().load({ metadata }));
    return Promise.all(promises);
  };

  const changeCurrentPage = (operation) => {
    setLoading(true);
    if (operation === 'next') {
      setCurrentPage((prevValue) => prevValue + 1);
    } else {
      setCurrentPage((prevValue) => (prevValue > 1 ? prevValue - 1 : 1));
    }
  };

  return (
    <div>
      <head>
        <title>Metaplex and Next.js example</title>
        <link rel="icon" href="/favicon.ico"      />
      </head>
      <div>
        <div>
          <h1>Wallet Address</h1>
          <div>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <button onClick={fetchNFTs}>
              Fetch
            </button>
          </div>
          {loading ? (
            <img src="" />
          ) : (
            currentView &&
            currentView.map((nft, index) => (
              <div key={index}>
                <h1>{nft.name}</h1>
                <img
                  src={nft?.json?.image || '/fallbackImage.jpg'}
                  alt="The downloaded illustration of the provided NFT address."
                />
              </div>
            ))
          )}
          {currentView && (
            <div>
              <button
                onClick={() => changeCurrentPage('previous')}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => changeCurrentPage('next')}
                disabled={currentPage === nftList.length / perPage}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
