import {
  type IconDefinition,
  iconCatalog,
  isIconDefinition,
  searchIconCatalog,
} from '@joralvmel/cosmos-icons';
import { Icon, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { iconLoaders } from '../src/icon-loaders';

function useIcon(name: string) {
  const [icon, setIcon] = useState<IconDefinition>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setIcon(undefined);
    setError('');
    const loader = iconLoaders[name];
    if (!loader) {
      setError('Unknown icon.');
    } else {
      loader()
        .then(module => {
          const definition = Object.values(module).find(isIconDefinition);
          if (!definition) throw new Error('Invalid icon');
          if (active) setIcon(definition);
        })
        .catch(() => {
          if (active) setError('Could not load the icon.');
        });
    }
    return () => {
      active = false;
    };
  }, [name]);
  return { icon, error };
}

function IconChoice({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  const { icon, error } = useIcon(name);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Select ${name}`}
      {...(Platform.OS === 'web'
        ? { 'aria-pressed': selected }
        : { accessibilityState: { selected } })}
      onPress={onSelect}
      style={{
        minHeight: 44,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.sm,
        padding: theme.space.sm,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: theme.colors.bg,
      }}
    >
      {icon ? (
        <Icon icon={icon} />
      ) : (
        <Text style={{ color: theme.colors['fg-muted'] }}>
          {error ? 'Preview unavailable' : '…'}
        </Text>
      )}
      <Text style={{ color: theme.colors.fg }}>{name}</Text>
    </Pressable>
  );
}

export default function IconScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [name, setName] = useState('circle');
  const { icon, error } = useIcon(name);
  const [size, setSize] = useState('32');
  const [width, setWidth] = useState('2');
  const [stroke, setStroke] = useState('foreground');
  const [fill, setFill] = useState('none');
  const matches = searchIconCatalog(iconCatalog, query);
  const numberSize = Number(size);
  const numberWidth = Number(width);
  const validSize = size.trim() !== '' && Number.isFinite(numberSize) && numberSize > 0;
  const validWidth = width.trim() !== '' && Number.isFinite(numberWidth) && numberWidth >= 0;
  const heading = {
    color: theme.colors.fg,
    fontSize: theme.text.md,
    fontWeight: theme.weight.semibold,
  } as const;
  const text = { color: theme.colors.fg };
  const inputStyle = {
    color: theme.colors.fg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: theme.space.sm,
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
      // First tap on a result or control acts even while the search keyboard is open.
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Icon' }} />
      <Text style={heading}>Search icons</Text>
      <TextInput
        accessibilityLabel="Search icons"
        value={query}
        onChangeText={value => {
          setQuery(value);
          setVisibleCount(10);
        }}
        style={inputStyle}
      />
      <Text accessibilityLiveRegion="polite" style={text}>
        Showing {Math.min(visibleCount, matches.length)} of {matches.length} icons. Type to narrow
        results.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
        {matches.slice(0, visibleCount).map(item => (
          <IconChoice
            key={item.name}
            name={item.name}
            selected={name === item.name}
            onSelect={() => setName(item.name)}
          />
        ))}
      </View>
      {visibleCount < matches.length && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setVisibleCount(count => count + 50)}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={text}>Show more icons</Text>
        </Pressable>
      )}
      {visibleCount > 10 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setVisibleCount(10)}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={text}>Show fewer icons</Text>
        </Pressable>
      )}
      <Text style={heading}>Selected: {name}</Text>
      {error ? (
        <Text accessibilityRole="alert" style={text}>
          {error}
        </Text>
      ) : icon && validSize && validWidth ? (
        <Icon
          icon={icon}
          size={numberSize}
          stroke={stroke === 'foreground' ? theme.colors.fg : theme.colors.border}
          fill={fill === 'none' ? 'none' : theme.colors.surface}
          strokeWidth={numberWidth}
        />
      ) : (
        <Text style={text}>{icon ? 'Enter valid dimensions.' : 'Loading icon…'}</Text>
      )}
      {icon && (
        <View>
          <Text style={heading}>Informative</Text>
          <Icon icon={icon} decorative={false} label={name} />
        </View>
      )}
      <Text style={heading}>Size (positive number)</Text>
      <TextInput
        accessibilityLabel="Size"
        keyboardType="decimal-pad"
        value={size}
        onChangeText={setSize}
        style={inputStyle}
      />
      <Text style={heading}>Stroke width (nonnegative SVG units)</Text>
      <TextInput
        accessibilityLabel="Stroke width"
        keyboardType="decimal-pad"
        value={width}
        onChangeText={setWidth}
        style={inputStyle}
      />
      <Text style={heading}>Stroke: {stroke}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setStroke(stroke === 'foreground' ? 'border' : 'foreground')}
        style={{ minHeight: 44 }}
      >
        <Text style={text}>Toggle stroke token</Text>
      </Pressable>
      <Text style={heading}>Fill: {fill}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setFill(fill === 'none' ? 'surface' : 'none')}
        style={{ minHeight: 44 }}
      >
        <Text style={text}>Toggle fill token</Text>
      </Pressable>
      <Text style={text}>
        Fill applies to any icon, but the result depends on its paths. Try circle for a closed
        outline and arrow-right for open paths. Fill does not create a designed solid variant.
      </Text>
      <Text style={text}>
        This explorer references the full catalog. Native production bundles include all those
        icons; application code should import only the individual icons it uses.
      </Text>
    </ScrollView>
  );
}
