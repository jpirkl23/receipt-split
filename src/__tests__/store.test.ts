import { describe, it, expect, beforeEach } from 'vitest';
import { useReceiptStore } from '@/store';
import { getMockDemoReceipt } from '@/lib/ocr';
import { Receipt } from '@/types';

describe('Zustand Store', () => {
  beforeEach(() => {
    const store = useReceiptStore.getState();
    store.reset();
  });

  it('should initialize with empty state', () => {
    const store = useReceiptStore.getState();

    expect(store.receipt).toBeNull();
    expect(store.people).toHaveLength(0);
    expect(store.results).toBeNull();
  });

  it('should set receipt', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);

    expect(store.receipt).toEqual(receipt);
  });

  it('should add person', () => {
    const store = useReceiptStore.getState();

    store.addPerson('Alice');
    store.addPerson('Bob');

    expect(store.people).toHaveLength(2);
    expect(store.people[0].name).toBe('Alice');
    expect(store.people[1].name).toBe('Bob');
  });

  it('should rename person', () => {
    const store = useReceiptStore.getState();

    store.addPerson('Alice');
    const personId = store.people[0].id;

    store.renamePerson(personId, 'Alicia');

    expect(store.people[0].name).toBe('Alicia');
  });

  it('should remove person', () => {
    const store = useReceiptStore.getState();

    store.addPerson('Alice');
    store.addPerson('Bob');

    const personId = store.people[0].id;
    store.removePerson(personId);

    expect(store.people).toHaveLength(1);
    expect(store.people[0].name).toBe('Bob');
  });

  it('should assign item to person', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);
    store.addPerson('Alice');

    const itemId = receipt.lineItems[0].id;
    const personId = store.people[0].id;

    store.assignItemToPerson(itemId, personId);

    expect(store.people[0].assignedItemIds).toContain(itemId);
  });

  it('should unassign item', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);
    store.addPerson('Alice');

    const itemId = receipt.lineItems[0].id;
    const personId = store.people[0].id;

    store.assignItemToPerson(itemId, personId);
    expect(store.people[0].assignedItemIds).toContain(itemId);

    store.unassignItem(itemId);
    expect(store.people[0].assignedItemIds).not.toContain(itemId);
  });

  it('should get assigned items', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);
    store.addPerson('Alice');

    const itemId = receipt.lineItems[0].id;
    const personId = store.people[0].id;

    store.assignItemToPerson(itemId, personId);

    const assignedItems = store.getAssignedItems(personId);
    expect(assignedItems).toHaveLength(1);
    expect(assignedItems[0].id).toBe(itemId);
  });

  it('should get unassigned items', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);
    store.addPerson('Alice');

    const itemId = receipt.lineItems[0].id;
    const personId = store.people[0].id;

    store.assignItemToPerson(itemId, personId);

    const unassignedItems = store.getUnassignedItems();
    expect(unassignedItems.length).toBe(receipt.lineItems.length - 1);
  });

  it('should update tip config and recalculate results', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);
    store.addPerson('Alice');
    store.addPerson('Bob');

    // Assign all items
    receipt.lineItems.forEach((item, idx) => {
      if (idx % 2 === 0) {
        store.assignItemToPerson(item.id, store.people[0].id);
      } else {
        store.assignItemToPerson(item.id, store.people[1].id);
      }
    });

    // Set custom tip
    store.setTipConfig({ percentage: 25, basis: 'pretax' });

    expect(store.tipConfig.percentage).toBe(25);
    expect(store.results).toBeDefined();
  });

  it('should reset store', () => {
    const store = useReceiptStore.getState();
    const receipt = getMockDemoReceipt();

    store.setReceipt(receipt);
    store.addPerson('Alice');

    expect(store.people).toHaveLength(1);
    expect(store.receipt).toBeDefined();

    store.reset();

    expect(store.people).toHaveLength(0);
    expect(store.receipt).toBeNull();
  });
});
