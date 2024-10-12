import { useRef, useEffect } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'

interface ContainerTerminalProps {
	container_id: string
}

const ContainerTerminal = ({ container_id }: ContainerTerminalProps) => {
	const xtermRef = useRef<HTMLDivElement | null>(null)
	const terminalRef = useRef<Terminal | null>(null)
	const socketRef = useRef<WebSocket | null>(null)

	useEffect(() => {
		console.log('Use effect', container_id)

		// if (terminalRef.current) {
		// 	// Terminal is already initialized
		// 	return
		// }

		const terminal = new Terminal({
			theme: {
				background: '#1E1E1E',
				foreground: '#D4D4D4',
			},
		})
		terminalRef.current = terminal

		const fitAddon = new FitAddon()

		terminal.loadAddon(fitAddon)
		terminal.open(xtermRef.current!)
		fitAddon.fit()
		fitAddon.proposeDimensions()

		const socket = new WebSocket(
			`ws://localhost:8000/docker-ws/${container_id}`,
		)
		socketRef.current = socket

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
			terminal.write(event.data)
		}

		// Simulate a command execution
		terminal.write('$ ')

		// Listen for key events
		terminal.onKey(
			({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
				console.log(domEvent)
				console.log(key)
				const printable =
					!domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey
				if (key === '\r') {
					terminal.write('\r\n$ ')
					socket.send('\r')
				} else if (domEvent.key === 'Backspace') {
					const cursorX = terminal.buffer.active.cursorX
					if (cursorX > 2) {
						terminal.write('\b \b')
						socket.send('\b')
					}
				} else if (printable) {
					terminal.write(key)
					socket.send(key)
				}
			},
		)
		return () => {
			console.log('Cleanup')
			if (terminalRef.current) {
				// terminalRef.current?.dispose()
				terminalRef.current = null
				console.log('Terminal disposed')
			}
			if (socketRef.current) {
				socketRef.current.close()
				socketRef.current = null
				console.log('Socket disposed')
			}
		}
	}, [container_id])

	return (
		<div
			ref={xtermRef}
			style={{ height: '225px', width: '100%', marginTop: 'auto' }}
		></div>
	)
}

export default ContainerTerminal
