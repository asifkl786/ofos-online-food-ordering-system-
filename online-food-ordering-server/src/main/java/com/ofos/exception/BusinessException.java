package com.ofos.exception;

public class BusinessException extends RuntimeException {
    /**
	 * Asif Khan April 2026
	 */
	private static final long serialVersionUID = 1L;

	public BusinessException(String message) {
	   super(message);
	}
}