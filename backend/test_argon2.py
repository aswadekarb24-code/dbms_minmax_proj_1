"""Automated tests for argon2-cffi password hashing replacing bcrypt."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()


def test_hash_produces_string():
    """hash_password returns a non-empty string."""
    h = ph.hash("mysecretpassword")
    assert isinstance(h, str)
    assert len(h) > 0
    print("  [PASS] hash produces string")


def test_hash_is_non_deterministic():
    """Same password hashed twice produces different hashes (salted)."""
    h1 = ph.hash("samepassword")
    h2 = ph.hash("samepassword")
    assert h1 != h2
    print("  [PASS] hashing is salted (non-deterministic)")


def test_verify_correct_password():
    """Correct password verifies successfully."""
    h = ph.hash("correctpassword")
    assert ph.verify(h, "correctpassword") is True
    print("  [PASS] correct password verifies successfully")


def test_verify_wrong_password():
    """Wrong password raises VerifyMismatchError, which we catch and return False."""
    h = ph.hash("correctpassword")
    try:
        ph.verify(h, "wrongpassword")
        assert False, "Should have raised VerifyMismatchError"
    except VerifyMismatchError:
        pass  # Expected
    print("  [PASS] wrong password raises VerifyMismatchError correctly")


def test_long_password_no_limit():
    """Argon2 does NOT have a 72-byte limit (unlike bcrypt)."""
    long_password = "a" * 100  # 100-char password, would fail bcrypt
    h = ph.hash(long_password)
    assert ph.verify(h, long_password)
    print("  [PASS] 100-char password works (no bcrypt 72-byte limit)")


def test_special_char_password():
    """Passwords with special chars like @ # ! work fine."""
    special_password = "P@ssw0rd!#$%^&*"
    h = ph.hash(special_password)
    assert ph.verify(h, special_password)
    print("  [PASS] special characters in password work fine")


def test_empty_password_hashes():
    """Empty string password is hashed (edge case)."""
    h = ph.hash("")
    assert ph.verify(h, "")
    print("  [PASS] empty password edge case handled")


def test_unicode_password():
    """Unicode characters in password work correctly."""
    unicode_password = "पासवर्ड123"
    h = ph.hash(unicode_password)
    assert ph.verify(h, unicode_password)
    print("  [PASS] unicode password works fine")


if __name__ == "__main__":
    tests = [
        test_hash_produces_string,
        test_hash_is_non_deterministic,
        test_verify_correct_password,
        test_verify_wrong_password,
        test_long_password_no_limit,
        test_special_char_password,
        test_empty_password_hashes,
        test_unicode_password,
    ]
    print("\n=== Argon2-CFFI Password Hashing Tests ===\n")
    failed = 0
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"  [FAIL] {test.__name__}: {e}")
            failed += 1

    total = len(tests)
    passed = total - failed
    print(f"\n{'='*40}")
    print(f"Results: {passed}/{total} passed", "✅" if failed == 0 else "❌")
    sys.exit(failed)
