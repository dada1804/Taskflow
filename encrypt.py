def encrypt_password(password, shift=4):
    encrypted_password = ""
    for char in password:
        if char.isalpha():
            shift_amount = shift % 26
            new_char = chr((ord(char.lower()) - 97 + shift_amount) % 26 + 97)
            if char.isupper():
                new_char = new_char.upper()
            encrypted_password += new_char
        else:
            encrypted_password += char
    return encrypted_password

def decrypt_password(encrypted_password, shift=4):
    decrypted_password = ""
    for char in encrypted_password:
        if char.isalpha():
            shift_amount = shift % 26
            new_char = chr((ord(char.lower()) - 97 - shift_amount) % 26 + 97)
            if char.isupper():
                new_char = new_char.upper()
            decrypted_password += new_char
        else:
            decrypted_password += char
    return decrypted_password

