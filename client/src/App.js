import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import './App.css';
import { sequence } from '0xsequence';
import { ethers } from 'ethers';
import TodoAbi from './utils/Todo.json';
import Task from './Task';
import { TodoContractAddress } from './config';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const goerliChainId = '0x05';
  sequence.initWallet('goerli');

  const getAllTasks = async () => {
    try {
      const wallet = sequence.getWallet();
      if (wallet) {
        const signer = wallet.getSigner(5);
        const TaskContract = new ethers.Contract(
          TodoContractAddress,
          TodoAbi.abi,
          signer,
        );

        const allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log('Not signed in');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTasks();
  }, []);

  // Calls Sequence to connect wallet
  const connectWallet = async () => {
    const wallet = sequence.getWallet();

    const connectDetails = await wallet.connect({
      networkId: goerliChainId,
      app: 'Todo',
      authorize: true,
      settings: {
        theme: 'light',
      },
    });

    console.log(connectDetails);

    if (connectDetails.chainId === goerliChainId) {
      setCorrectNetwork(true);
    }
    if (!connectDetails.connected) {
      console.log('User wallet not connected. Error:', connectDetails.error);
    } else if (connectDetails.connected) {
      console.log('Users signed connect proof to valid their account address:', connectDetails.proof);
    }

    setCurrentAccount(connectDetails.session.accountDetails);
  };

  const addTask = async (e) => {
    e.preventDefault();

    const task = {
      taskText: input,
      isDeleted: false,
    };

    try {
      const wallet = sequence.getWallet();

      if (wallet) {
        const signer = wallet.getSigner(5);
        const TaskContract = new ethers.Contract(
          TodoContractAddress,
          TodoAbi.abi,
          signer,
        );

        await TaskContract.addTask(task.taskText, task.isDeleted)
          .then((response) => {
            setTasks([...tasks, task]);
            console.log('Completed Task', response);
          })
          .catch((err) => {
            console.log('Error occured while adding a new task', err);
          });
      } else {
        console.log('Ethereum object doesn\'t exist!');
      }
    } catch (error) {
      console.log('Error submitting new Tweet', error);
    }

    setInput('');
  };

  const deleteTask = (key) => async () => {
    console.log(key);

    // Now we got the key, let's delete our todo
    try {
      const wallet = sequence.getWallet();

      if (wallet) {
        const signer = wallet.getSigner();
        const TaskContract = new ethers.Contract(
          TodoContractAddress,
          TodoAbi.abi,
          signer,
        );

        await TaskContract.deleteTask(key, true);
        const allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log('Ethereum object doesn\'t exist');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {currentAccount === '' ? (
        <button
          type="submit"
          className="text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : correctNetwork ? (
        <div className="App">
          <h2> Task Management App</h2>
          <form>
            <TextField
              id="outlined-basic"
              label="Make Todo"
              variant="outlined"
              style={{ margin: '0px 5px' }}
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={addTask}>Add Task</Button>
          </form>
          <ul>
            {tasks.map((item) => (
              <Task
                key={item.id}
                taskText={item.taskText}
                onClick={deleteTask(item.id)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3">
          <div>----------------------------------------</div>
          <div>Not connected to Goerli Testnet</div>
          <div>and reload the page</div>
          <div>----------------------------------------</div>
        </div>
      )}
    </div>
  );
}

export default App;
