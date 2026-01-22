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
import { Calendar1Icon } from 'lucide-react';
import { format } from 'date-fns';
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
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      return newData;
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setPlannedDate(date);
    handleChange('plannedTime', format(date, 'yyyy-MM-dd'));
    setIsDateOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">New decision</DialogTitle>
          <DialogDescription className="text-xs">
            Fill in the details of your planned action before you trade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="plannedTime" className="text-xs">
              Planned time
            </Label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button>
                  {plannedDate ? (
                    format(plannedDate, 'yyyy-MM-dd')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent /* 这里放一些 padding / width 的类名 */>
                <Calendar
                  mode="single"
                  selected={plannedDate}
                  onSelect={handleDateSelect}
                  captionLayout="dropdown"
                  startMonth={new Date(2000, 0)} // 2000-01
                  endMonth={new Date(2035, 11)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Action</Label>
              <Select
                value={formData.actionType}
                onValueChange={(val) => handleChange('actionType', val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="add">Add position</SelectItem>
                  <SelectItem value="trim">Trim position</SelectItem>
                  <SelectItem value="dca">DCA / Regular buy</SelectItem>
                  <SelectItem value="resist">Resist impulse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Object type</Label>
              <Select
                value={formData.objectType}
                onValueChange={(val) => handleChange('objectType', val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
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

          <div className="space-y-1">
            <Label htmlFor="objectName" className="text-xs">
              Object name
            </Label>
            <Input
              id="objectName"
              placeholder="e.g. TSLA / VOO"
              className="h-8 text-xs"
              value={formData.objectName}
              onChange={(e) => handleChange('objectName', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount" className="text-xs">
              Amount
            </Label>
            <Input
              id="amount"
              placeholder="e.g. 2000"
              className="h-8 text-xs"
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
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
