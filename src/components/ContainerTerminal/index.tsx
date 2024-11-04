import { useRef, useEffect, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'
import './index.css'

interface ContainerTerminalProps {
	container_id: string
	onCloseTerminal: () => void
}

const ContainerTerminal = ({ container_id, onCloseTerminal }: ContainerTerminalProps) => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const xtermRef = useRef<HTMLDivElement | null>(null)
	const [terminal, setTerminal] = useState<Terminal | null>(null)
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const commandRef = useRef<string>('')

	useEffect(() => {
		console.log('Initializing terminal with container-id=', container_id)
		setTerminal(
			new Terminal({
				theme: {
					background: '#1E1E1E',
					foreground: '#D4D4D4',
				},
				
			}),
		)
		setSocket(new WebSocket(`ws://localhost:8000/docker-ws/${container_id}`))
	}, [container_id])

	useEffect(() => {
		if (terminal === null || socket === null || xtermRef.current === null) {
			return
		}

		console.log('Starting terminal')

		const fitAddon = new FitAddon()
		terminal.loadAddon(fitAddon)
		terminal.open(xtermRef.current!)
		fitAddon.fit()
		fitAddon.proposeDimensions()

		socket.onopen = () => {
			console.log('WebSocket connection established')
		}

		socket.onclose = () => {
			console.log('WebSocket connection closed')
		}

		socket.onerror = (event) => {
			console.error('WebSocket error:', event)
		}

		socket.onmessage = (event) => {
			console.log('WebSocket message:', event.data)
			terminal.write(event.data)
		}

		// Simulate a command execution
		// terminal.write('$ ')

		// Listen for key events
		terminal.onKey(
			({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
				const printable =
					!domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey
				if (key === '\r') {
					terminal.write('\r\n ')
					console.log('Sending: ', commandRef.current)
					socket.send(commandRef.current + '\r')
					commandRef.current = ''
				} else if (domEvent.key === 'Backspace') {
					const cursorX = terminal.buffer.active.cursorX
					if (cursorX > 2) {
						terminal.write('\b \b')
						commandRef.current = commandRef.current.slice(0, -1)
					}
				} else if (printable) {
					terminal.write(key)
					commandRef.current += key
				}
			},
		)

		const resizeObserver = new ResizeObserver(() => {
            if (xtermRef.current) {
                fitAddon.fit()
            }
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

		return () => {
			console.log('Cleanup')
			if (terminal) {
				terminal?.dispose()

				console.log('Terminal disposed')
			}
			if (socket) {
				socket.close()

				console.log('Socket disposed')
			}
			setTerminal(null)
			setSocket(null)
		}
	}, [terminal, socket])

	const killTerminal = () => {
        if (terminal) {
            terminal.dispose()
        }
        if (socket) {
            socket.close()
            console.log('Socket disposed')
        }
        setTerminal(null)
        setSocket(null)
		onCloseTerminal()
    }

	return (
		<div ref={containerRef}  style={{ height: '100%', width: '100%', backgroundColor:'#1e1e1e', paddingBottom: '50px'}}>
			<div className='bg-slate-300 pl-2 p-1 pb-2 w-full mt-auto flex items-center'>
				<button
					onClick={killTerminal}
					className='bg-slate-500 hover:bg-slate-700 text-white py-2 px-2 h-6 rounded text-xs flex items-center justify-center'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						className='w-4 h-4'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>
				<span className='ml-2'>container: {container_id}</span>
			</div>
			<div
				ref={xtermRef}
				style={{ height: '100%', width: '100%', marginBlockStart: '10px', marginBlockEnd: '10px' }}
			></div>
		</div>
	)
}

export default ContainerTerminal
