import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable, StyleSheet, Text, View,
} from 'react-native';
import colors from '@/constants/colors';

const C = colors.light;

export interface Worker {
  id: number;
  name: string;
  phone?: string;
  rating?: number;
  totalDeliveries?: number;
  isAvailable?: boolean;
}

interface WorkerSelectorProps {
  workers: Worker[];
  selectedWorker?: Worker;
  onSelect: (worker: Worker) => void;
}

function Icon({ name, size = 16, color = C.foreground }: { name: keyof typeof Feather.glyphMap; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

export function WorkerSelector({ workers, selectedWorker, onSelect }: WorkerSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Assign Delivery Worker</Text>

      <Pressable
        style={styles.trigger}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.triggerContent}>
          <Icon name="user" size={16} color={C.primary} />
          <Text style={styles.triggerText}>
            {selectedWorker ? selectedWorker.name : 'Select a worker'}
          </Text>
        </View>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={C.mutedForeground}
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.dropdown}>
          {workers.length === 0 ? (
            <Text style={styles.emptyText}>No workers available</Text>
          ) : (
            workers.map((worker) => (
              <Pressable
                key={worker.id}
                style={[
                  styles.option,
                  selectedWorker?.id === worker.id && styles.optionSelected,
                ]}
                onPress={() => {
                  onSelect(worker);
                  setIsExpanded(false);
                }}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{worker.name}</Text>
                    {worker.phone && (
                      <Text style={styles.optionPhone}>{worker.phone}</Text>
                    )}
                  </View>
                  {worker.rating && (
                    <View style={styles.rating}>
                      <Icon name="star" size={12} color="#FBBF24" />
                      <Text style={styles.ratingText}>{worker.rating}</Text>
                    </View>
                  )}
                </View>
                {selectedWorker?.id === worker.id && (
                  <Icon name="check-circle" size={18} color={C.primary} />
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#496057',
    backgroundColor: C.background,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerText: {
    color: C.foreground,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#496057',
    backgroundColor: C.background,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#496057',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#2B3E35',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  optionPhone: {
    color: C.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#2B3E35',
  },
  ratingText: {
    color: C.primaryForeground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  emptyText: {
    color: C.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
