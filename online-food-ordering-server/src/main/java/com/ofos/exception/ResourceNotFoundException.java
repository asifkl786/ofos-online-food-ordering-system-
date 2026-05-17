package com.ofos.exception;

public class ResourceNotFoundException extends RuntimeException {
    /**
	 * Asif Khan April 2026
	 */
	private static final long serialVersionUID = 1L;

	public ResourceNotFoundException(String message) {
	   super(message);
	}
}
