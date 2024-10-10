import { useEffect, useState } from 'react';
import FileExplorer from '../FileExplorer';
import {
    CreateNewContainer,
    StartContainer,
  GetUserContainers,
  DeleteContainer,
  useContainerStore,
  StopContainer,
} from '../../services/ContainerService';

interface ContainerManagerProps {
  token: string | null;
}

const ContainerList = ({ token }: ContainerManagerProps) => {
  const { containers, setContainers } = useContainerStore();
  const [openContainerId, setOpenContainerId] = useState<string | null>(null); // Track open containers

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setContainers(await GetUserContainers(token ?? ''));
      } catch (error) {
        console.error('Error fetching containers:', error);
      }
    };

    fetchContainers();
  }, [token, setContainers]);

  const handleAddNewContainer = async () => {
    try {
      const newContainer = await CreateNewContainer(token ?? '');
      console.log(newContainer)
      setContainers([...containers, newContainer]);
    } catch (error) {
      console.error('Error starting new container:', error);
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      await StopContainer(containerId, token ?? '');
      setContainers(await GetUserContainers(token ?? ''));
    } catch (error) {
      console.error('Error starting new container:', error);
    }
  };

  const handleStartContainer = async (containerId: string) => {
    try {
      await StartContainer(containerId, token ?? '');
      setContainers(await GetUserContainers(token ?? ''));
    } catch (error) {
      console.error('Error starting new container:', error);
    }
  };

  const handleDeleteContainer = async (containerId: string) => {
    try {
      await DeleteContainer(containerId, token ?? '');
      setContainers(containers.filter(container => container.container_id !== containerId));
    } catch (error) {
      console.error('Error deleting container:', error);
    }
  };

  const toggleContainer = (containerId: string) => {
    setOpenContainerId(openContainerId === containerId ? null : containerId);
  };

  return (
    <div>
      <div className='mb-4'>
        <button
          onClick={handleAddNewContainer}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Start New Container
        </button>
      </div>

      <div>
        <h3 className='text-lg font-semibold mb-2'>Your Containers:</h3>
        <ul>
          {containers.length > 0 ? (
            containers.map(container => (
              <li key={container.id} className='mb-2'>
                <div className='bg-gray-700 p-3 rounded'>
                  <p className='text-xs'>
                    <strong>ID:</strong> {container.id}
                  </p>
                  <p className='text-xs'>
                    <strong>Name:</strong> {container.container_name}
                  </p>
                  <p className='text-xs'>
                    <strong>Status:</strong> {container.status}
                  </p>

                  <button
                    onClick={() => handleStartContainer(container.container_id)}
                    className='mr-2 bg-blue-600 hover:bg-blue-400 text-white py-1 px-2 rounded mt-2 text-xs'
                  >
                    Start
                  </button>

                  <button
                    onClick={() => handleStopContainer(container.container_id)}
                    className='mr-2 bg-orange-600 hover:bg-orange-300 text-white py-1 px-2 rounded mt-2 text-xs'
                  >
                    Stop
                  </button>

                  <button
                    onClick={() => handleDeleteContainer(container.container_id)}
                    className='mr-2 bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded mt-2 text-xs'
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => toggleContainer(container.id)}
                    className='mr-2 bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded mt-2 text-xs ml-2'
                  >
                    {openContainerId === container.id ? 'Hide Options' : 'Show Options'}
                  </button>

                  {openContainerId === container.id && (
                    <div className='mt-3'>
                      <FileExplorer />
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <p>No containers available</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ContainerList;
