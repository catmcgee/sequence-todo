import React, {useState, useEffect} from 'react';
import {TextField, Button} from "@mui/material";
import Task from './Task';
import './App.css'
import { sequence } from "0xsequence";
import { TodoContractAddress } from './config';
import { ethers } from 'ethers';
import TodoAbi from './utils/Todo.json'

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  let wallet = sequence.initWallet('mainnet')
  const goerliChainId = "0x05"

  const getAllTasks = async() => {
    try {
      const wallet = sequence.getWallet()
      if(wallet) {
        const signer = wallet.getSigner(5);
        const TaskContract = new ethers.Contract(
          TodoContractAddress,
          TodoAbi.abi,
          signer
        )
  
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("Not signed in");
      }
    } catch(error) {
      console.log(error);
    }
  }
    
    useEffect(() => {
        getAllTasks()
      },[]);
      
      // Calls Sequence to connect wallet
    const connectWallet = async () => {
       wallet = sequence.getWallet()

      const connectDetails = await wallet.connect({
        networkId: "goerli",
        app: 'Todo',
        authorize: true,
        settings: {
          theme: "light",
        }
      })

console.log('Wallet connected:', connectDetails.connected)


if (connectDetails.chainId === goerliChainId) {
  setCorrectNetwork(true)
}
if ( !connectDetails.connected ) {
  console.log("User wallet not connected. Error:", connectDetails.error); }
else if (connectDetails.connected) {
  console.log('Users signed connect proof to valid their account address:', connectDetails)
};

wallet = sequence.getWallet()
setCurrentAccount(connectDetails.session.accountDetails)
wallet.openWallet();

    }  
      
    const addTask= async (e)=>{
      e.preventDefault();
  
      let task = {
        'taskText': input,
        'isDeleted': false
      };

  
      try {
        let wallet = sequence.getWallet()

          if(wallet) {
          const provider = wallet.getProvider()
          const signer = wallet.getSigner(5);
          const TaskContract = new ethers.Contract(
            TodoContractAddress,
            TodoAbi.abi,
            signer
          )
  
        await TaskContract.addTask(task.taskText, task.isDeleted)
          .then(response => {
            setTasks([...tasks, task]);
            console.log("Completed Task");
          })
          .catch(err => {
            console.log("Error occured while adding a new task");
          });
          ;
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch(error) {
        console.log("Error submitting new Tweet", error);
      }

      
      
  
      setInput('')
    };
    
    const deleteTask = key => async() => {
      console.log(key);
  
      // Now we got the key, let's delete our todo
      try {
        const wallet = sequence.getWallet()
  
        if(wallet) {
          const signer = wallet.getSigner();
          const TaskContract = new ethers.Contract(
            TodoContractAddress,
            TodoAbi.abi,
            signer
          )
  
          let deleteTask = await TaskContract.deleteTask(key, true);
          let allTasks = await TaskContract.getMyTasks();
          setTasks(allTasks);
        } else {
          console.log("Ethereum object doesn't exist");
        }
  
      } catch(error) {
        console.log(error);
      }
    }
  
    return (
      <div>
  {currentAccount === '' ? (
    <button
    className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
    onClick={connectWallet}
    >
    Connect Wallet
    </button>
    ) : correctNetwork ? (
      <div className="App">
        <h2> Task Management App</h2>
        <form>
           <TextField id="outlined-basic" label="Make Todo" variant="outlined" style={{margin:"0px 5px"}} size="small" value={input}
           onChange={e=>setInput(e.target.value)} />
          <Button variant="contained" color="primary" onClick={addTask}  >Add Task</Button>
        </form>
        <ul>
            {tasks.map(item=> 
              <Task 
                key={item.id} 
                taskText={item.taskText} 
                onClick={deleteTask(item.id)}
              />)
            }
        </ul>
      </div>
    ) : (
    <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
    <div>----------------------------------------</div>
    <div>Please connect to the Goerli Testnet</div>
    <div>and reload the page</div>
    <div>----------------------------------------</div>
    </div>
  )}
  </div>
    );
  }
  
  export default App;