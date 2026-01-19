import { COLOR_PRESETS, ColorPreset } from '@/types/announcement';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPresets?: boolean;
  presets?: ColorPreset[];
  onPresetSelect?: (preset: ColorPreset) => void;
}

export function ColorPicker({
  label,
  value,
  onChange,
  showPresets = false,
  presets = COLOR_PRESETS,
  onPresetSelect,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <div
          className="w-10 h-10 rounded-lg border-2 border-gray-200 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 cursor-pointer border-0 p-0 rounded-lg"
        />
      </div>

      {showPresets && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">Color Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  onChange(preset.value);
                  onPresetSelect?.(preset);
                }}
                className={cn(
                  'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                  value === preset.value ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200'
                )}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
