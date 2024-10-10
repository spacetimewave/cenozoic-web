import { useRef, useLayoutEffect } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'

const ContainerTerminal = () => {
	const xtermRef = useRef<HTMLDivElement | null>(null)
	const terminalRef = useRef<Terminal | null>(null)

	useLayoutEffect(() => {
		if (terminalRef.current) {
			// Terminal is already initialized
			return
		}

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
				} else if (domEvent.key === 'Backspace') {
					const cursorX = terminal.buffer.active.cursorX
					if (cursorX > 2) {
						terminal.write('\b \b')
					}
				} else if (printable) {
					terminal.write(key)
				}
			},
		)

		return () => {
			terminal.dispose()
			terminalRef.current = null
		}
	}, [])

	return (
		<div
			ref={xtermRef}
			style={{ height: '225px', width: '100%', marginTop: 'auto' }}
		></div>
	)
}

export default ContainerTerminal
