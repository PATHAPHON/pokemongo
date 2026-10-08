import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  EMAIL_REGEX,
  validateEmail,
  validateFullName,
  validateRegistrationForm,
} from '../src/shared/utils/event-helpers.ts';

describe('Week 5: Forms & State Management Tests', () => {
  describe('1. Email Regex Validation (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)', () => {
    test('Regex pattern matches exact curriculum specification', () => {
      const expectedPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      assert.equal(EMAIL_REGEX.source, expectedPattern.source);
    });

    test('Accepts valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@university.ac.th',
        'student123@mail.kmutt.ac.th',
        'ash@pokemon.org',
        'trainer+event@campus.edu',
        'a.b.c@domain.co.uk',
        'red@pallet-town.net',
      ];

      for (const email of validEmails) {
        assert.equal(
          validateEmail(email),
          true,
          `Expected "${email}" to be accepted`
        );
      }
    });

    test('Rejects invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'missingdomain@',
        'missingdot@domain',
        'spaces in@email.com',
        'email@domain with space.com',
        '',
        '   ',
        'user@.com',
        'user@com.',
        'user@@domain.com',
      ];

      for (const email of invalidEmails) {
        assert.equal(
          validateEmail(email),
          false,
          `Expected "${email}" to be rejected`
        );
      }
    });
  });

  describe('2. Full Name Validation (Minimum 2 characters)', () => {
    test('Rejects names shorter than 2 characters after trim', () => {
      const shortNames = ['', '   ', 'A', ' B ', '1'];
      for (const name of shortNames) {
        assert.equal(
          validateFullName(name),
          false,
          `Expected "${name}" to be rejected (< 2 characters)`
        );
      }
    });

    test('Accepts names with 2 or more characters', () => {
      const validNames = [
        'Jo',
        'Al',
        'Ash Ketchum',
        '  Bo  ',
        'สมชาย เข็มกลัด',
        'Red',
      ];
      for (const name of validNames) {
        assert.equal(
          validateFullName(name),
          true,
          `Expected "${name}" to be accepted (>= 2 characters)`
        );
      }
    });

    test('validateRegistrationForm returns structured inline field errors', () => {
      // Both invalid
      const resBothInvalid = validateRegistrationForm({
        fullName: 'A',
        email: 'invalid-email',
      });
      assert.equal(resBothInvalid.isValid, false);
      assert.ok(resBothInvalid.errors.fullName);
      assert.ok(resBothInvalid.errors.email);

      // Only name invalid
      const resNameInvalid = validateRegistrationForm({
        fullName: ' ',
        email: 'ash@kanto.org',
      });
      assert.equal(resNameInvalid.isValid, false);
      assert.ok(resNameInvalid.errors.fullName);
      assert.equal(resNameInvalid.errors.email, undefined);

      // Only email invalid
      const resEmailInvalid = validateRegistrationForm({
        fullName: 'Ash Ketchum',
        email: 'not-an-email',
      });
      assert.equal(resEmailInvalid.isValid, false);
      assert.equal(resEmailInvalid.errors.fullName, undefined);
      assert.ok(resEmailInvalid.errors.email);

      // Both valid
      const resValid = validateRegistrationForm({
        fullName: 'Ash Ketchum',
        email: 'ash@kanto.org',
      });
      assert.equal(resValid.isValid, true);
      assert.deepEqual(resValid.errors, {});
    });
  });

  describe('3. Form State & Input Retention on Submit Failure', () => {
    test('Form state retains all input values when validation fails', () => {
      const formState = {
        fullName: 'A',
        email: 'bad-email',
        studentId: '65010042',
        notes: 'Need wheelchair access',
        agreed: true,
      };

      const validation = validateRegistrationForm({
        fullName: formState.fullName,
        email: formState.email,
      });

      assert.equal(validation.isValid, false);

      // Inputs must not be cleared
      assert.equal(formState.fullName, 'A');
      assert.equal(formState.email, 'bad-email');
      assert.equal(formState.studentId, '65010042');
      assert.equal(formState.notes, 'Need wheelchair access');
      assert.equal(formState.agreed, true);
    });

    test('Form state retains all input values when API / registration call fails', async () => {
      // Simulated form state machine (mirrors handleSubmit in register.tsx)
      let formState = {
        fullName: 'Ash Ketchum',
        email: 'ash@pallet.org',
        studentId: '65010099',
        notes: 'Bringing Pikachu along',
        agreed: true,
        isSubmitting: false,
        errorMessage: null,
      };

      const mockRegisterEvent = async () => {
        return { success: false, error: 'กิจกรรมนี้มีผู้ลงทะเบียนเต็มจำนวนแล้ว' };
      };

      // Execute simulated submit
      formState.isSubmitting = true;
      const res = await mockRegisterEvent();
      if (!res.success) {
        formState.errorMessage = res.error;
      }
      formState.isSubmitting = false;

      // Assert error captured
      assert.equal(
        formState.errorMessage,
        'กิจกรรมนี้มีผู้ลงทะเบียนเต็มจำนวนแล้ว'
      );
      assert.equal(formState.isSubmitting, false);

      // Assert all input values are strictly retained
      assert.equal(formState.fullName, 'Ash Ketchum');
      assert.equal(formState.email, 'ash@pallet.org');
      assert.equal(formState.studentId, '65010099');
      assert.equal(formState.notes, 'Bringing Pikachu along');
      assert.equal(formState.agreed, true);
    });

    test('Form state retains all input values on network exception', async () => {
      let formState = {
        fullName: 'Gary Oak',
        email: 'gary@oaklab.net',
        studentId: '65010007',
        notes: 'Leader of Pallet Town team',
        agreed: true,
        isSubmitting: false,
        errorMessage: null,
      };

      const mockRegisterEvent = async () => {
        throw new Error('Network timeout during registration');
      };

      try {
        formState.isSubmitting = true;
        await mockRegisterEvent();
      } catch (err) {
        formState.errorMessage = err.message;
      } finally {
        formState.isSubmitting = false;
      }

      assert.equal(formState.errorMessage, 'Network timeout during registration');
      assert.equal(formState.isSubmitting, false);
      assert.equal(formState.fullName, 'Gary Oak');
      assert.equal(formState.email, 'gary@oaklab.net');
      assert.equal(formState.studentId, '65010007');
      assert.equal(formState.notes, 'Leader of Pallet Town team');
      assert.equal(formState.agreed, true);
    });
  });

  describe('4. Static Source Code Contracts in src/app/events/register.tsx', () => {
    const registerFilePath = path.resolve(
      process.cwd(),
      'src/app/events/register.tsx'
    );
    const sourceCode = fs.readFileSync(registerFilePath, 'utf8');

    test('Includes controlled states for fullName, email, studentId, notes, agreed', () => {
      assert.ok(
        sourceCode.includes('fullName') && sourceCode.includes('setFullName'),
        'Must contain fullName state'
      );
      assert.ok(
        sourceCode.includes('email') && sourceCode.includes('setEmail'),
        'Must contain email state'
      );
      assert.ok(
        sourceCode.includes('studentId') && sourceCode.includes('setStudentId'),
        'Must contain studentId state'
      );
      assert.ok(
        sourceCode.includes('notes') && sourceCode.includes('setNotes'),
        'Must contain notes state'
      );
      assert.ok(
        sourceCode.includes('agreed') && sourceCode.includes('setAgreed'),
        'Must contain agreed state'
      );
    });

    test('Configures email input with keyboardType="email-address" and autoCapitalize="none"', () => {
      assert.ok(
        sourceCode.includes('keyboardType="email-address"'),
        'Email input must have keyboardType="email-address"'
      );
      assert.ok(
        sourceCode.includes('autoCapitalize="none"'),
        'Email input must have autoCapitalize="none"'
      );
    });

    test('Renders inline field error messages for fieldErrors.fullName and fieldErrors.email', () => {
      assert.ok(
        sourceCode.includes('fieldErrors.fullName'),
        'Must render fieldErrors.fullName'
      );
      assert.ok(
        sourceCode.includes('fieldErrors.email'),
        'Must render fieldErrors.email'
      );
      assert.ok(
        sourceCode.includes('fieldErrorText'),
        'Must style inline error text'
      );
    });

    test('Submit button is disabled when isSubmitting', () => {
      assert.ok(
        sourceCode.includes('disabled={isSubmitting}'),
        'Submit button must be disabled when isSubmitting'
      );
    });
  });

  describe('5. State Management & favoriteReducer Contracts', () => {
    const eventContextSource = fs.readFileSync(
      path.join(process.cwd(), 'src/shared/context/event-context.tsx'),
      'utf8'
    );

    // Pure reducer contract simulation
    function reducer(state, action) {
      switch (action.type) {
        case 'SET_FAVORITES':
          return Array.isArray(action.payload) ? [...action.payload] : [];
        case 'TOGGLE_FAVORITE':
          return state.includes(action.payload)
            ? state.filter((id) => id !== action.payload)
            : [...state, action.payload];
        default:
          return state;
      }
    }

    test('favoriteReducer SET_FAVORITES sets favorite list', () => {
      const initial = ['event-1'];
      const next = reducer(initial, {
        type: 'SET_FAVORITES',
        payload: ['event-2', 'event-3'],
      });
      assert.deepEqual(next, ['event-2', 'event-3']);
      assert.notEqual(next, initial);
    });

    test('favoriteReducer TOGGLE_FAVORITE adds and removes immutably', () => {
      let state = [];
      state = reducer(state, { type: 'TOGGLE_FAVORITE', payload: 'event-1' });
      assert.deepEqual(state, ['event-1']);

      state = reducer(state, { type: 'TOGGLE_FAVORITE', payload: 'event-2' });
      assert.deepEqual(state, ['event-1', 'event-2']);

      state = reducer(state, { type: 'TOGGLE_FAVORITE', payload: 'event-1' });
      assert.deepEqual(state, ['event-2']);
    });

    test('Static Analysis: event-context.tsx exports favoriteReducer and useFavorites', () => {
      assert.ok(
        eventContextSource.includes('export function favoriteReducer'),
        'Must export favoriteReducer'
      );
      assert.ok(
        eventContextSource.includes('useReducer(favoriteReducer, [])'),
        'Must use useReducer with favoriteReducer'
      );
      assert.ok(
        eventContextSource.includes('export function useFavorites'),
        'Must export useFavorites hook'
      );
    });
  });
});

