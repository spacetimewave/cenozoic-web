const SaveModal = ({ fileName, onSave, onDiscard, onCancel }) => (
	<div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 border border-gray-300 z-50'>
		<p className='mb-4'>
			Do you want to save changes to {fileName} before closing?
		</p>
		<div className='flex justify-end'>
			<button
				onClick={onSave}
				className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mr-2'
			>
				Save
			</button>
			<button
				onClick={onDiscard}
				className='bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2'
			>
				Discard
			</button>
			<button
				onClick={onCancel}
				className='bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded'
			>
				Cancel
			</button>
		</div>
	</div>
)

export default SaveModal
