import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import Modal from 'react-native-modal';
import { SvgXml } from 'react-native-svg';
import { colors } from '../styles/colors';
import budgetData from '../mockups/budget.json';

const { width } = Dimensions.get('window');

export function TransactionDetailsModal({ 
  isVisible, 
  onClose, 
  transaction 
}) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const categoryBudget = budgetData.budgetCategories.find(
    budget => budget.name === transaction.category
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="${colors.grey.dark}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 6L18 18" stroke="${colors.grey.dark}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      useNativeDriverForBackdrop={true}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Transaction Details</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <SvgXml 
              xml={closeIconSvg}
              width={24} 
              height={24} 
            />
          </TouchableOpacity>
        </View>

        {/* Transaction Content */}
        <View style={styles.transactionContent}>
          {/* Category Icon and Amount */}
          <View style={styles.transactionHeader}>
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>
                {isIncome ? '💰' : (categoryBudget?.icon || '💳')}
              </Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[
                styles.transactionAmount,
                { color: isIncome ? '#4CAF50' : '#f44336' }
              ]}>
                {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
              </Text>
              <Text style={styles.transactionType}>
                {isIncome ? 'Income' : 'Expense'}
              </Text>
            </View>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsContainer}>
            <DetailRow 
              label="Description" 
              value={transaction.description} 
            />
            <DetailRow 
              label="Merchant" 
              value={transaction.merchant} 
            />
            <DetailRow 
              label="Category" 
              value={transaction.category} 
            />
            <DetailRow 
              label="Payment Method" 
              value={transaction.paymentMethod} 
            />
            <DetailRow 
              label="Date" 
              value={formatDate(transaction.date)} 
            />
            <DetailRow 
              label="Time" 
              value={formatTime(transaction.date)} 
            />
            <DetailRow 
              label="Transaction ID" 
              value={transaction.id} 
            />
          </View>

          {/* Category Budget Info (for expenses only) */}
          {!isIncome && categoryBudget && (
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetInfoTitle}>Category Budget</Text>
              <View style={styles.budgetProgress}>
                <View style={styles.budgetLabels}>
                  <Text style={styles.budgetLabel}>Spent</Text>
                  <Text style={styles.budgetLabel}>Budget</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${Math.min((categoryBudget.spent / categoryBudget.budgetLimit) * 100, 100)}%`,
                        backgroundColor: categoryBudget.spent > categoryBudget.budgetLimit ? '#f44336' : colors.primary
                      }
                    ]} 
                  />
                </View>
                <View style={styles.budgetAmounts}>
                  <Text style={styles.budgetAmount}>${categoryBudget.spent.toFixed(2)}</Text>
                  <Text style={styles.budgetAmount}>${categoryBudget.budgetLimit.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Delete Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper component for detail rows
function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: colors.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  transactionContent: {
    paddingHorizontal: 20,
  },
  transactionHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.light,
    marginBottom: 20,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: colors.grey.light,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 28,
  },
  amountContainer: {
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.light,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.dark,
    fontFamily: 'AlbertSans_500Medium',
    flex: 2,
    textAlign: 'right',
  },
  budgetInfo: {
    backgroundColor: colors.grey.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  budgetInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 12,
  },
  budgetProgress: {
    // No additional styles needed
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  deleteButton: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
    fontFamily: 'AlbertSans_600SemiBold',
  },
});
