import { useState } from "react"
import { ChevronDown, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { users, type User } from "@/data/users"

const roleLabels = {
  ops_manager: "Ops Manager",
  flight_instructor: "Flight Instructor", 
  maintenance_officer: "Maintenance Officer",
  compliance_officer: "Compliance Officer",
  accounts_officer: "Accounts Officer",
  student: "Student"
}

interface RoleSwitcherProps {
  currentUser: User;
  onUserChange: (user: User) => void;
}

export function RoleSwitcher({ currentUser, onUserChange }: RoleSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 h-9">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-3 w-3 text-primary" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium truncate">{currentUser.name}</span>
            <Badge variant="secondary" className="text-xs h-4 px-1">
              {roleLabels[currentUser.role]}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {users.map((user) => (
          <DropdownMenuItem 
            key={user.id} 
            onClick={() => onUserChange(user)}
            className="flex items-center gap-3 p-3"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-muted-foreground">{roleLabels[user.role]}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}