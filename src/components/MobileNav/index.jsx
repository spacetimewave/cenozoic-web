import { HomeIcon } from '../../assets/icons/HomeIcon'
import { SearchIcon } from '../../assets/icons/SearchIcon'
import { MessageIcon } from '../../assets/icons/MessageIcon'
import { ProfileIcon } from '../../assets/icons/ProfileIcon'
import styles from './index.module.css'
import { NavLink } from 'react-router-dom'

export default function MobileNav() {
	return (
		<footer className={styles.footer}>
			<nav className={styles.nav}>
				<NavLink
					to='/feed'
					className={({ isActive }) =>
						isActive ? styles.navlink_active : styles.navlink_inactive
					}
				>
					<HomeIcon width='30px' height='30px' />
				</NavLink>
				<NavLink
					to='/search'
					className={({ isActive }) =>
						isActive ? styles.navlink_active : styles.navlink_inactive
					}
				>
					<SearchIcon width='30px' height='30px' />
				</NavLink>
				<NavLink
					to='/messages'
					className={({ isActive }) =>
						isActive ? styles.navlink_active : styles.navlink_inactive
					}
				>
					<MessageIcon width='30px' height='30px' />
				</NavLink>
				<NavLink
					to='/profile'
					className={({ isActive }) =>
						isActive ? styles.navlink_active : styles.navlink_inactive
					}
				>
					<ProfileIcon width='30px' height='30px' />
				</NavLink>
			</nav>
		</footer>
	)
}
