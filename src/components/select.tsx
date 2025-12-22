import { ReactNode, useState } from "react";
import { Icon, Picker } from "zmp-ui";

export interface SelectProps<T> {
  renderTitle: (selectedItem?: T) => ReactNode;
  renderItemKey: (item: T) => string;
  renderItemLabel?: (item: T) => string;
  items: T[];
  value?: T;
  onChange: (selectedItem?: T) => void;
}

export default function Select<T>(props: SelectProps<T>) {
  const [localValue, setLocalValue] = useState(props.value ? props.renderItemKey(props.value) : "");

  // If there are no items, render a simple placeholder to avoid mounting Picker
  if (!props.items || props.items.length === 0) {
    return (
      <div className="flex-none h-12 border border-black/15 rounded-lg relative [&>.zaui-picker-input]:absolute [&>.zaui-picker-input]:inset-0 [&>.zaui-picker-input]:opacity-0">
        <div className="h-full relative flex items-center px-4 space-x-2">
          <div className="text-sm text-left w-full">{props.renderTitle ? props.renderTitle(props.value) : "Chọn"}</div>
          <Icon icon="zi-chevron-down" />
        </div>
      </div>
    );
  }

  const flush = () => {
    const selectedItem = props.items.find((item) => props.renderItemKey(item) === localValue);
    props.onChange(selectedItem);
  };

  return (
    <div className="flex-none h-12 border border-black/15 rounded-lg relative [&>.zaui-picker-input]:absolute [&>.zaui-picker-input]:inset-0 [&>.zaui-picker-input]:opacity-0">
      <Picker
        mask
        maskClosable
        title={props.renderTitle() as unknown as string}
        data={[
          {
            name: "localValue",
            options: props.items.map((item) => ({
              displayName: props.renderItemLabel?.(item) ?? props.renderItemKey(item),
              key: props.renderItemKey(item),
              value: props.renderItemKey(item),
            })),
          },
        ]}
        value={{
          localValue,
        }}
        onChange={({ localValue }) => {
          setLocalValue(localValue.key ?? "");
        }}
        action={{
          text: "OK",
          close: true,
          onClick: () => {
            flush();
          },
        }}
      />
      <div className="h-full relative flex items-center px-4 space-x-2 pointer-events-none">
        <div className="text-sm text-left w-full">{props.renderTitle ? props.renderTitle(props.value) : String(props.value)}</div>
        <Icon icon="zi-chevron-down" />
      </div>
    </div>
  );
}
