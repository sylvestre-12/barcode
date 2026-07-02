import { useAuth } from '@/context/AuthContext'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, signOut } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <header className="flex items-center justify-between bg-[#1A1A1A] px-6 py-3 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2B705] font-bold text-[#1A1A1A]">
          SS
        </div>
        <span className="hidden text-sm font-semibold tracking-wide md:block">
          SSF BARCODE-BASED DIGITAL CHECK-IN AND CHECK-OUT SYSTEM
        </span>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2B705] text-sm font-bold text-[#1A1A1A]">
                {initials}
              </div>
              <div className="hidden text-left text-sm md:block">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs capitalize text-gray-400">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs capitalize text-gray-500">{user?.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}