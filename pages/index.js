import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useContractRead, useContractWrite } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import CommonAds from 'src/common-ads'
import { parseEther } from "viem";

const styles = {
  container: {
    textAlign: 'left',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  button: {
    backgroundColor: '#4CAF50', // Green
    border: 'none',
    color: 'white',
    padding: '15px 32px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '4px 2px',
    cursor: 'pointer',
  },
  input: {
    padding: '12px 20px',
    margin: '8px 0',
    display: 'block', // Changed to block to stack vertically
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    width: '100%', // Set width to 100% to fill the parent
  },
  inputContainer: {
    marginBottom: '20px', // Add some space below the container
  },
  connectedInfo: {
    backgroundColor: '#f2f2f2',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  profileContainer: {
    position: 'absolute', // Positioning relative to the first positioned ancestor
    top: 0, // Align to the top of the container
    right: 0, // Align to the right of the container
    padding: '10px', // Add some space from the edges of the screen
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // This will create a responsive grid with a minimum column width of 250px
    gridGap: '20px', // This is the gap between the cards
    padding: '20px', // Add padding around the entire grid for better spacing from the container's edges
  },
  card: {
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    transition: '0.3s',
    borderRadius: '5px', // use var(--border-radius) if you want to be consistent with global styles
    padding: '2px 16px',
    margin: '16px',
    textAlign: 'center',
  }
};

//checks for users wallet connection
function Profile() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  })
  const { disconnect } = useDisconnect()

  // const metadata = useContractRead({
  //   ...CommonAds,
  //   functionName: 'getMetadata',
  //   args: [address, 0]
  // })
  // console.log('metadata:', metadata.data)

  if (isConnected)
    return (
      <div style={styles.connectedInfo}>
        Connected to {address}
        <button style={styles.button} onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  return <button style={styles.button} onClick={() => connect()}>Connect Wallet</button>
}


export default function Home() {
  const [contract, setContract] = useState(null);

  const [metadata, setMetadata] = useState({ name: "", desc: "", link: "", img: "" });
  const [prices, setPrices] = useState([0, 0, 0]);

  const [spaceId, setSpaceId] = useState(0);
  const [spaceData, setSpaceData] = useState(null);

  const [claims, setClaims] = useState([]); // Added state to track claims
  const [filter, setFilter] = useState(''); // Holds the current filter

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMetadata((prevState) => ({ ...prevState, [name]: value }));
  };

  // Define your options for the work scope dropdown
  const workScopeOptions = [
    "Research & Development",
    "Community Service",
    "Education",
    "Healthcare",
    "Technology",
    "Environment",
    "Longevity"
    // ... add other options as needed
  ];

  // Function to handle the filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Filtered claims based on the selected work scope
  const filteredClaims = claims.filter(claim => {
    return filter === '' || claim.link === filter; // If filter is empty, return all claims, otherwise return claims that match the filter
  });


  {/* Functions for creating a space */ }

  const { write: writeMetadata } = useContractWrite({
    ...CommonAds,
    functionName: 'setMetadata',
    gasLimit: 300000,
    args: [0, metadata]
  });

  const { write: createSpace } = useContractWrite({
    ...CommonAds,
    functionName: 'create',
    gasLimit: 300000,
    args: [0, prices]
  })

  const handleCreateCard = async () => {
    console.log('create space button clicked')
    // await writeMetadata();
    // await createSpace();
    setClaims(prevClaims => [...prevClaims, metadata]); // Add new claim to the list
    // Now call your blockchain functions to store the claim
    await writeMetadata();
    await createSpace();
    // Optionally reset metadata state here if you want the input fields to clear after submission
    setMetadata({ name: "", desc: "", link: "", img: "" });
  }

  {/* Functions for fetching a space */ }

  const fetchSpace = useContractRead({
    ...CommonAds,
    functionName: 'getSpace',
    args: [spaceId],
    onSuccess: (data) => {
      console.log('Success:', data);
      setSpaceData(data);  // Update state with fetched data
    },
    onError: (error) => {
      console.error('Error fetching space:', error);
    },
  });

  const handleFetchSpace = () => {
    console.log('fetching space')
    if (spaceId && !isNaN(spaceId)) {  // Check if spaceId is defined and is a valid number
      setSpaceData(fetchSpace.data);
      console.log(fetchSpace.data)
      console.log('Space Data', spaceData)
      console.log('Space Owner', spaceData[0])
      console.log('Space Owner', spaceData[1].name)
    } else {
      console.error('Invalid spaceId:', spaceId);
    }
  };

  {/* Functions for buying a sponsor spot */ }
  const { write: buyNFT } = useContractWrite({
    ...CommonAds,
    functionName: 'buy',
    // args: [spotId, 0, newPrice],
    //spotId: getSpace, spotId = (spaceId << 8) | spotIndex
    //newPrice: 
    value: null //current price
  })

  const handleBuy = () => {
    console.log('buying nft')
    //set new price for spot
    //also need to get existing price from getting space
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileContainer}>
        <Profile />
      </div>
      <h1 style={{ paddingBottom: 30 }}>Fund your Research</h1>
      {/* <Profile /> */}
      <h2>Create an Impact Claim</h2>
      <div style={styles.inputContainer}>
        <input style={styles.input} name="name" value={metadata.name} onChange={handleInputChange} placeholder="Name of Impact" />
        <input style={styles.input} name="desc" value={metadata.desc} onChange={handleInputChange} placeholder="Description" />
        {/* <input style={styles.input} name="link" value={metadata.link} onChange={handleInputChange} placeholder="Work Scope" /> */}
        {/* Dropdown for Work Scope */}
        <select style={styles.input} name="link" value={metadata.link} onChange={handleInputChange}>
          <option value="">Select Work Scope</option>
          {workScopeOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <input style={styles.input} name="img" value={metadata.img} onChange={handleInputChange} placeholder="Project Image" />
        <button style={styles.button} onClick={handleCreateCard}>Submit Claim</button>
      </div>

      {/* Dropdown for filtering cards based on work scope */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label htmlFor="workScopeFilter">Filter by Work Scope:</label>
        <select
          id="workScopeFilter"
          style={styles.input}
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="">All Work Scopes</option>
          {workScopeOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Grid container for cards */}
      <div style={styles.gridContainer}>
        {filteredClaims.map((claim, index) => (
          <div key={index} style={styles.card}>
            <h3>{claim.name}</h3>
            <p>{claim.desc}</p>
            <p>{claim.link}</p>
            {/* Image could be displayed here if img is a URL */}
            <img src={claim.img} alt={claim.name} style={{ width: '100%', height: 'auto', borderRadius: styles.card.borderRadius }} />
            <p><button style={styles.button} onClick={() => handleBuy(claim)}>Buy Claim</button></p>
          </div>
        ))}
      </div>




      {/* <h2>Fetch Space</h2>
      <input style={styles.input} placeholder="Space ID" onChange={(e) => setSpaceId(e.target.value)} />
      <button style={styles.button} onClick={handleFetchSpace}>Fetch Space</button> */}


      {/* <input
        placeholder="Space ID"
        onChange={(e) => setSpaceId(e.target.value)}
      />
      <button onClick={handleFetchSpace}>Fetch Space</button> */}

      {/* {spaceId && (
        <div>
          <h3>Owner: {spaceData[0]}</h3>
          <p>{spaceData[1].img}</p>
          <p>{spaceData[1].name}</p>
          <p>{spaceData[1].desc}</p>
          <p>{spaceData[1].link}</p>
          <button onClick={handleBuy}>Buy for ${prices[0]}</button>
        </div>
      )} */}
    </div>
  );
}

