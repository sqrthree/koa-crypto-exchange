# koa-crypto-exchange

A exchange middleware based on RSA.

## How to generate key file with openssl:

```bash
# Gen private key:
openssl genrsa -out app_private_key.pem 1024

# Gen public key:
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem
```

---

> [sqrtthree.com](https://sqrtthree.com/) &nbsp;&middot;&nbsp;
> GitHub [@sqrthree](https://github.com/sqrthree) &nbsp;&middot;&nbsp;
> Twitter [@sqrtthree](https://twitter.com/sqrtthree)
