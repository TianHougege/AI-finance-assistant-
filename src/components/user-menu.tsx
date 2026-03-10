'use client';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export default function UserMenu({ email }: { email?: string | null }) {
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

  const initial = email ? email[0].toUpperCase() : 'U';
  const displayName = email ?? 'Account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2.5 h-10 rounded-full bg-slate-800 px-3 text-slate-50 hover:bg-slate-700 hover:text-slate-50"
        >
          <div className="h-6 w-6 rounded-full bg-slate-500 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-white">{initial}</span>
          </div>
          <span className="text-sm max-w-[140px] truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52 border border-slate-700 bg-slate-900 text-slate-50 shadow-lg"
        align="end"
      >
        <DropdownMenuLabel className="text-slate-400 text-xs font-normal">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-slate-50">
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-slate-800 text-red-400 focus:text-red-400"
          onClick={handleSignOut}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
