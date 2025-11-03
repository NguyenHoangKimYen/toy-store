import React from 'react'
import Account from './Account'
import { Fragment } from 'react'
import Tabs from './Tabs/Tabs'
import SearchField from './SearchField'

const Sidebar = () => {
  return (
    <Fragment>
      <div className='overflow-y-auto sticky top-4 h-full'>
        <Account />
        <SearchField />
        <Tabs />
      </div>


    </Fragment>
  )
}

export default Sidebar
