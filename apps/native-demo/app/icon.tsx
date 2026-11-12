import {
  type IconDefinition,
  iconCatalog,
  isIconDefinition,
  searchIconCatalog,
} from '@joralvmel/cosmos-icons';
import { Icon, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { iconLoaders } from '../src/icon-loaders';

export default function IconScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [name, setName] = useState('heart');
  const [icon, setIcon] = useState<IconDefinition>();
  const [error, setError] = useState('');
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

  useEffect(() => {
    let active = true;
    setIcon(undefined);
    setError('');
    const loader = iconLoaders[name];
    if (!loader) {
      setError('Unknown icon.');
      return () => {
        active = false;
      };
    }
    loader()
      .then(module => {
        const definition = Object.values(module).find(isIconDefinition);
        if (!definition) throw new Error('Invalid icon');
        if (active) setIcon(definition);
      })
      .catch(() => {
        if (active) setError('Could not load the selected icon.');
      });
    return () => {
      active = false;
    };
  }, [name]);

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
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.name}`}
            onPress={() => setName(item.name)}
            style={{
              minHeight: 44,
              justifyContent: 'center',
              paddingHorizontal: theme.space.sm,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={text}>{item.name}</Text>
          </Pressable>
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
        Heart and star have compatible geometry for fill; other icons may not.
      </Text>
    </ScrollView>
  );
}
