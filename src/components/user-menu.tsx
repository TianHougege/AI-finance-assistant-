'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const router = useRouter();
  const handleSignOut = async () => {
    const res = await fetch('/api/auth/sign-out', { method: 'POST' });
    if (!res.ok) {
      console.error('Failed to sign out');
      return;
    }
    router.replace('/auth');
    router.refresh();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 rounded-md bg-slate-800 px-3 text-slate-50 hover:bg-slate-700 hover:text-slate-50"
        >
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border border-slate-700 bg-slate-900 text-slate-50 shadow-lg"
        align="end"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
            Team
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
              Invite users
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="border border-slate-700 bg-slate-900 text-slate-50">
                <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
                  Message
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
                  More...
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
          GitHub
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
          Support
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="opacity-50">
          API
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-slate-800 focus:text-slate-50"
          onClick={handleSignOut}
        >
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
