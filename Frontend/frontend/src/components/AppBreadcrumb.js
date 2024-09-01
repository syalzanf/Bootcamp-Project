// import React from 'react'
// import { useLocation } from 'react-router-dom'
// import { useTranslation } from 'react-i18next'
// import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react-pro'

// import routes from '../routes'

// const AppBreadcrumb = () => {
//   const currentLocation = useLocation().pathname
//   const { t } = useTranslation()

//   const getRouteName = (pathname, routes) => {
//     const currentRoute = routes.find((route) => route.path === pathname)
//     return currentRoute ? currentRoute.name : false
//   }

//   const getBreadcrumbs = (location) => {
//     const breadcrumbs = []
//     location.split('/').reduce((prev, curr, index, array) => {
//       const currentPathname = `${prev}/${curr}`
//       const routeName = getRouteName(currentPathname, routes)
//       routeName &&
//         breadcrumbs.push({
//           pathname: currentPathname,
//           name: routeName,
//           active: index + 1 === array.length ? true : false,
//         })
//       return currentPathname
//     })
//     return breadcrumbs
//   }

//   const breadcrumbs = getBreadcrumbs(currentLocation)

//   return (
//     <CBreadcrumb className="m-0">
//       <CBreadcrumbItem href="/dashboard">{t('home')}</CBreadcrumbItem>
//       {breadcrumbs.map((breadcrumb, index) => {
//         return (
//           <CBreadcrumbItem
//             {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
//             key={index}
//           >
//             {breadcrumb.name}
//           </CBreadcrumbItem>
//         )
//       })}
//     </CBreadcrumb>
//   )
// }

// export default React.memo(AppBreadcrumb)



import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react-pro'

import { adminRoutes, cashierRoutes, superadminRoutes } from '../routes'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const { t } = useTranslation()

  // Initialize state with values from localStorage
  const [user, setUser] = useState(localStorage.getItem('user'))
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'))

  useEffect(() => {
    // Update state from localStorage if needed
    setUser(localStorage.getItem('user'))
    setUserRole(localStorage.getItem('userRole'))
  }, [])

  // Determine routes based on the userRole
  let routes
  switch (userRole) {
    case 'admin':
      routes = adminRoutes
      break
    case 'superadmin':
      routes = superadminRoutes
      break
    case 'cashier':
      routes = cashierRoutes
      break
    default:
      routes = [] // Fallback or default routes if no role matches
  }

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        })
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  // Determine the home URL based on the userRole
  let homeHref = '/'

  switch (userRole) {
    case 'admin':
      homeHref = '/dashboard-admin'
      break
    case 'superadmin':
      homeHref = '/dashboard-superadmin'
      break
    case 'cashier':
      homeHref = '/dashboard-cashier'
      break
    default:
      homeHref = '/'  // fallback in case the role is undefined or doesn't match any known roles
  }

  return (
    <CBreadcrumb className="m-0">
      <CBreadcrumbItem href={homeHref}>{t('home')}</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <CBreadcrumbItem
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        )
      })}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)



// import React from 'react'
// import { useLocation } from 'react-router-dom'
// import { useTranslation } from 'react-i18next'
// import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react-pro'
// import { adminRoutes, cashierRoutes, superadminRoutes } from '../routes'

// // Gabungkan semua routes ke dalam satu array
// const allRoutes = [...adminRoutes, ...cashierRoutes, ...superadminRoutes]

// const AppBreadcrumb = () => {
//   const currentLocation = useLocation().pathname
//   const { t } = useTranslation()

//   const getRouteName = (pathname) => {
//     const currentRoute = allRoutes.find((route) => route.path === pathname)
//     return currentRoute ? t(currentRoute.name) : false
//   }

//   const getBreadcrumbs = (location) => {
//     const breadcrumbs = []
//     location.split('/').reduce((prev, curr, index, array) => {
//       const currentPathname = `${prev}/${curr}`
//       const routeName = getRouteName(currentPathname)
//       routeName &&
//         breadcrumbs.push({
//           pathname: currentPathname,
//           name: routeName,
//           active: index + 1 === array.length ? true : false,
//         })
//       return currentPathname
//     })
//     return breadcrumbs
//   }

//   const breadcrumbs = getBreadcrumbs(currentLocation)

//   return (
//     <CBreadcrumb className="m-0">
//       <CBreadcrumbItem href="/">{t('home')}</CBreadcrumbItem>
//       {breadcrumbs.map((breadcrumb, index) => (
//         <CBreadcrumbItem
//           {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
//           key={index}
//         >
//           {breadcrumb.name}
//         </CBreadcrumbItem>
//       ))}
//     </CBreadcrumb>
//   )
// }

// export default React.memo(AppBreadcrumb)
