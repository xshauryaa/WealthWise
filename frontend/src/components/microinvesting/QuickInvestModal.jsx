import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  SafeAreaView 
} from 'react-native';
import { colors } from '../../styles/colors';
import { X, DollarSign } from 'lucide-react-native';

const ASSET_OPTIONS = [
  { symbol: 'VTI', name: 'Total Stock Market ETF', type: 'etf' },
  { symbol: 'VXUS', name: 'International Stocks ETF', type: 'etf' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'BND', name: 'Total Bond Market ETF', type: 'bonds' },
];

export function QuickInvestModal({ visible, onClose, onInvest }) {
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(ASSET_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setLoading(true);
      await onInvest({
        amount: parseFloat(amount),
        assetType: selectedAsset.type,
        symbol: selectedAsset.symbol,
        notes: notes || `Manual investment in ${selectedAsset.name}`,
      });
      
      // Reset form
      setAmount('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Invest</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.grey.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Investment Amount</Text>
            <View style={styles.amountContainer}>
              <DollarSign size={20} color={colors.grey.dark} />
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Asset Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Select Asset</Text>
            {ASSET_OPTIONS.map((asset) => (
              <TouchableOpacity
                key={asset.symbol}
                style={[
                  styles.assetOption,
                  selectedAsset.symbol === asset.symbol && styles.selectedAsset
                ]}
                onPress={() => setSelectedAsset(asset)}
              >
                <View style={styles.assetInfo}>
                  <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                  <Text style={styles.assetName}>{asset.name}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedAsset.symbol === asset.symbol && styles.radioSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note about this investment..."
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.investButton, loading && styles.investButtonDisabled]}
            onPress={handleInvest}
            disabled={loading || !amount}
          >
            <Text style={styles.investButtonText}>
              {loading ? 'Investing...' : `Invest $${amount || '0'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.light,
  },
  title: {
    fontSize: 20,
    color: colors.dark,
    fontFamily: 'AlbertSans_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey.light,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginLeft: 8,
  },
  assetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.grey.ultraLight,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAsset: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  assetInfo: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.grey.medium,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  notesInput: {
    backgroundColor: colors.grey.light,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.grey.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.grey.light,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  investButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  investButtonDisabled: {
    opacity: 0.6,
  },
  investButtonText: {
    fontSize: 16,
    color: colors.light,
    fontFamily: 'AlbertSans_700Bold',
  },
});
