import Sidebar from '../../components/Sidebar'
import FileManager from '../../components/FileManager'

const App = () => {
	return (
		<div className='bg-zinc-700 flex h-screen w-screen'>
			<Sidebar />
			<FileManager />
		</div>
	)
}

export default App
