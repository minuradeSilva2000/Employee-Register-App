/**
 * Quick Action Domain Model
 * Defines all possible quick actions in the system
 */

import { Employee } from './Employee.model';

export enum QuickActionType {
  ADD_EMPLOYEE = 'ADD_EMPLOYEE',
  VIEW_EMPLOYEES = 'VIEW_EMPLOYEES',
  UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',
  SEARCH_EMPLOYEE = 'SEARCH_EMPLOYEE',
  FILTER_EMPLOYEES = 'FILTER_EMPLOYEES'
}

export interface QuickAction {
  id: string;
  type: QuickActionType;
  title: string;
  description: string;
  icon: string;
  color: string;
  requiresEmployee?: boolean;
}

export interface QuickActionPayload {
  type: QuickActionType;
  employee?: Employee;
  data?: any;
}

export interface QuickActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
