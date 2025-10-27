import React from 'react'
import { Card } from './ui/card'

const toaster = () => {
  return (
    <div>
      <Card className="w-full max-w-md shadow-lg border border-gray-300 dark:border-gray-800 bg-gray-100">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Toaster Component</h3>
          <p className="text-gray-600 dark:text-gray-400">This is a placeholder for the Toaster component.</p>
        </div>
      </Card>
    </div>
  )
}

export default toaster
