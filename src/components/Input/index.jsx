import styles from './index.module.css'

export default function Input({ onChange = () => {}, onClick = () => {} }) {
	return (
		<input
			type='password'
			placeholder=''
			onClick={onClick()}
			className={styles.input}
		></input>
	)
}
