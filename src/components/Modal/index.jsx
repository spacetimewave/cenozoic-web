const SaveModal = ({ fileName, onSave, onDiscard, onCancel }) => (
	<div
		style={{
			position: 'fixed',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			backgroundColor: 'white',
			padding: '20px',
			border: '1px solid #ccc',
			zIndex: 1000,
		}}
	>
		<p>Do you want to save changes to {fileName} before closing?</p>
		<button onClick={onSave}>Save</button>
		<button onClick={onDiscard} style={{ marginLeft: '10px' }}>
			Discard
		</button>
		<button onClick={onCancel} style={{ marginLeft: '10px' }}>
			Cancel
		</button>
	</div>
)

export default SaveModal
