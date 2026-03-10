'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useState } from 'react';
import { format } from 'date-fns';

type DecisionFormData = {
  plannedTime: string;
  actionType: 'buy' | 'sell' | 'trim' | 'add' | 'dca' | 'resist';
  objectType: 'stock' | 'fund' | 'bond' | 'cash' | 'crypto' | 'other';
  objectName: string;
  amount: string;
};

type DecisionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DecisionFormData) => void;
};

const initialFormData: DecisionFormData = {
  plannedTime: '',
  actionType: 'buy',
  objectType: 'stock',
  objectName: '',
  amount: '',
};

export default function DecisionDialog({
  open,
  onOpenChange,
  onSubmit,
}: DecisionDialogProps) {
  const [formData, setFormData] = useState<DecisionFormData>(initialFormData);
  const [plannedDate, setPlannedDate] = useState<Date | undefined>(undefined);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const handleChange = (field: keyof DecisionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setPlannedDate(date);
    handleChange('plannedTime', format(date, 'yyyy-MM-dd'));
    setIsDateOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">New Decision</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Fill in the details of your planned action before you trade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Planned date */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Planned Date</Label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white h-8 text-xs font-normal"
                >
                  {plannedDate
                    ? format(plannedDate, 'yyyy-MM-dd')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                <Calendar
                  mode="single"
                  selected={plannedDate}
                  onSelect={handleDateSelect}
                  captionLayout="dropdown"
                  startMonth={new Date(2000, 0)}
                  endMonth={new Date(2035, 11)}
                  className="text-slate-200"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action + Object type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Action</Label>
              <Select
                value={formData.actionType}
                onValueChange={(val) => handleChange('actionType', val)}
              >
                <SelectTrigger className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="add">Add Position</SelectItem>
                  <SelectItem value="trim">Trim Position</SelectItem>
                  <SelectItem value="dca">DCA / Regular Buy</SelectItem>
                  <SelectItem value="resist">Resist Impulse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Asset Type</Label>
              <Select
                value={formData.objectType}
                onValueChange={(val) => handleChange('objectType', val)}
              >
                <SelectTrigger className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="fund">Fund / ETF</SelectItem>
                  <SelectItem value="bond">Bond</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Object name */}
          <div className="space-y-1.5">
            <Label htmlFor="objectName" className="text-xs text-slate-400">
              Name / Ticker
            </Label>
            <Input
              id="objectName"
              placeholder="e.g. TSLA / VOO"
              className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              value={formData.objectName}
              onChange={(e) => handleChange('objectName', e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs text-slate-400">
              Amount
            </Label>
            <Input
              id="amount"
              placeholder="e.g. 2000"
              className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              setFormData(initialFormData);
              setPlannedDate(undefined);
            }}
            className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onSubmit(formData);
              setFormData(initialFormData);
              setPlannedDate(undefined);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
