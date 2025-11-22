import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Eye, EyeOff } from 'lucide-react'

export const PasswordInput = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  onBlur, 
  placeholder = "••••••••",
  className = "",
  error,
  touched,
  required = true 
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='space-y-2'>
      {label && (
        <Label htmlFor={id} className="text-sm font-semibold text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 ${
            touched && error ? 'border-red-400' : ''
          } ${className}`}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
