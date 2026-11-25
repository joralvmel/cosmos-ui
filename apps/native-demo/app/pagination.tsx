import { Button, Pagination, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function PaginationScreen() {
  const theme = useTheme();
  const [page, setPage] = useState(5);
  const [total, setTotal] = useState(20);
  const [compact, setCompact] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [edges, setEdges] = useState(false);
  const [variant, setVariant] = useState<'solid' | 'soft' | 'outline'>('solid');
  const label = { color: theme.colors.fg, fontSize: theme.text.md };
  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Pagination' }} />
      <Text style={label}>Controlled pagination</Text>
      <Pagination
        label="Results"
        totalPages={total}
        page={page}
        onPageChange={({ page: next }) => setPage(next)}
        presentation={compact ? 'compact' : 'numbered'}
        direction={rtl ? 'rtl' : 'ltr'}
        variant={variant}
        showFirstLast={edges}
        disabled={disabled}
      />
      <Text style={label}>
        Selected page: {page}; total pages: {total}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
        <Button variant="soft" onPress={() => setCompact(value => !value)}>
          Toggle compact
        </Button>
        <Button variant="soft" onPress={() => setDisabled(value => !value)}>
          Toggle disabled
        </Button>
        <Button variant="soft" onPress={() => setRtl(value => !value)}>
          Toggle RTL
        </Button>
        <Button variant="soft" onPress={() => setEdges(value => !value)}>
          Toggle first/last
        </Button>
        <Button
          variant="soft"
          onPress={() =>
            setVariant(value =>
              value === 'solid' ? 'soft' : value === 'soft' ? 'outline' : 'solid'
            )
          }
        >
          Cycle variant
        </Button>
        <Button variant="soft" onPress={() => setTotal(value => (value === 20 ? 3 : 20))}>
          Toggle total 3/20
        </Button>
      </View>
      <Text style={label}>Autonomous, small and 56-point custom minimum</Text>
      <Pagination
        label="Small results"
        totalPages={12}
        defaultPage={4}
        size="sm"
        variant="outline"
        controlStyle={{ minHeight: 56 }}
      />
      <Text style={label}>Large, localized compact presentation</Text>
      <Pagination
        label="Resultados"
        totalPages={12}
        defaultPage={3}
        size="lg"
        presentation="compact"
        locale="es"
        previousLabel="Página anterior"
        nextLabel="Página siguiente"
        pageLabel="Página {page}"
        summaryLabel="Página {page} de {total}"
      />
    </ScrollView>
  );
}
