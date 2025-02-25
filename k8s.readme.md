Inject jwt:

```
source .env
kubectl create secret generic jwt-secret --from-literal=JWT_SECRET=${JWT_SECRET}
```
