import React from 'react'
import Account from './Account'
import { Fragment } from 'react'
import Tabs from './Tabs'
import SearchField from './SearchField'

const Sidebar = () => {
  return (
    <Fragment>
        <div className='overflow-y-scroll sticky top-4 h-full'>
          <Account />
          <SearchField />
          <Tabs />
        </div>


    </Fragment>
  )
}

export default Sidebar
