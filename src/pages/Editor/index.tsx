import Sidebar from '../../components/Sidebar'
import FileManager from '../../components/FileManager'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useContainerStore } from '../../services/ContainerService'
import ContainerTerminal from '../../components/ContainerTerminal'

const App = () => {
	const { containerTerminals, setContainerTerminals } = useContainerStore()

	return (
		<div className='bg-zinc-700 flex h-screen w-screen'>
			<PanelGroup direction='horizontal'>
				<Panel defaultSize={18} minSize={18}>
					<Sidebar />
				</Panel>
				<PanelResizeHandle />
				<Panel>
					<PanelGroup direction='vertical'>
						<Panel id='filemanager' >
							<FileManager />
						</Panel>
						<PanelResizeHandle />

						{containerTerminals?.length === 0 ? null : (
							<Panel id='terminal' defaultSize={25} minSize={25}>
									<ContainerTerminal
										container_id={containerTerminals[0]}
										onCloseTerminal={() => {
											setContainerTerminals([])
										}}
									/>
							</Panel>
						)}
					</PanelGroup>
				</Panel>
			</PanelGroup>
		</div>
	)
}

export default App
