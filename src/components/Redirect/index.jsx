import { Link } from 'react-router-dom'

export default function Redirect() {
	return (
		<>
			Go back <Link to={'/'}> home</Link>
		</>
	)
}
