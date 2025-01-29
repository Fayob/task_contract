import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import contractABI from "./abi.json"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState(null)

  const contractAddress = "0xB4bD3b45Efab800117c7D6482Cd9f075C9806F33"

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)
    } else {
      toast.error("Please install an ethreum compatible wallet");
    }
  }, [])

  async function connectWallet() {
    if (provider) {
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)
      setContract(contract)
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts"})
      setAccount(accounts[0])
      toast.success("Wallet connected successfully")
    } catch (error) {
      toast.error("Wallet connection failed");
    }
  }

  async function fetchTasks(contract) {
    try {
      const myTasks = await contract.getMyTask();
      setTasks(myTasks);
    } catch (error) {
      toast.error("Error fetching tasks");
    }
  }

  async function addTask() {
    if (!taskTitle || !taskText || !contract) return;
    try {
      const tx = await contract.addTask(taskText, taskTitle, false);
      await tx.wait();
      fetchTasks(contract);
      setTaskTitle("");
      setTaskText("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async function deleteTask(taskId) {
    try {
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      fetchTasks(contract);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  return (
    <>
      <div> <ToastContainer position="top-right" autoClose={2000} /></div>
      <h1>Task Contract DApp</h1>
      {account ? <p>Connected to {account.slice(0, 6)}...{account.slice(account.length-6)} </p> :
      <button onClick={connectWallet}> Connect Wallet </button>
      }
      <div>
        <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task Title" />
        <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Task Description" className="mt-2" />
        <button onClick={addTask}>Add Task</button>
      </div>
      <div>
        {tasks.map((task) => (
          <div key={task.id}>
            <div>
              <h2>{task.taskTitle}</h2>
              <p>{task.taskText}</p>
              <button onClick={() => deleteTask(task.id)} variant="destructive">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
