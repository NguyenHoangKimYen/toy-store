import React from 'react'
import Account from './Account'
import { Fragment } from 'react'
import Search from './Search'

const Sidebar = () => {
  return (
    <Fragment>
        <div className='overflow-y-scroll sticky top-4 h-full'>
          <Account />
          <Search />
        </div>


    </Fragment>
  )
}

export default Sidebar
