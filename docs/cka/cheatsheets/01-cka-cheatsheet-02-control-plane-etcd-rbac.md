# Cheatsheet CKA: Control Plane, etcd, kubeadm, RBAC, CSR & Helm/Kustomize (25%)

## 1. Sao lưu & Khôi phục `etcd`
```bash
# Lấy đường dẫn cert từ /etc/kubernetes/manifests/etcd.yaml
grep -E "cert-file|key-file|trusted-ca-file" /etc/kubernetes/manifests/etcd.yaml

# Snapshot Save
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /opt/etcd-backup.db

# Snapshot Restore ra thư mục mới -> sau đó sửa hostPath.path trong /etc/kubernetes/manifests/etcd.yaml
ETCDCTL_API=3 etcdctl snapshot restore /opt/etcd-backup.db --data-dir=/var/lib/etcd-restored
```

## 2. Nâng cấp Cụm `kubeadm`
| Bước | Trên Control Plane đầu tiên | Trên Worker Node (hoặc CP phụ) |
| :--- | :--- | :--- |
| 1 | `kubectl drain cp --ignore-daemonsets` | `kubectl drain node01 --ignore-daemonsets --delete-emptydir-data` |
| 2 | `apt-mark unhold kubeadm && apt-get update && apt-get install -y kubeadm=1.31.0-* && apt-mark hold kubeadm` | Tương tự |
| 3 | `kubeadm upgrade plan` -> `kubeadm upgrade apply v1.31.0` | `kubeadm upgrade node` |
| 4 | `apt-mark unhold kubelet kubectl && apt-get install -y kubelet=1.31.0-* kubectl=1.31.0-* && apt-mark hold kubelet kubectl` | Tương tự |
| 5 | `systemctl daemon-reload && systemctl restart kubelet` | Tương tự |
| 6 | `kubectl uncordon cp` | `kubectl uncordon node01` |

## 3. Lệnh Imperative RBAC & `auth can-i`
```bash
kubectl create sa app-sa -n dev
kubectl create role dev-role --verb=get,list,watch,create --resource=pods,deployments.apps -n dev
kubectl create rolebinding dev-rb --role=dev-role --serviceaccount=dev:app-sa -n dev
kubectl create clusterrole node-ro --verb=get,list --resource=nodes
kubectl create clusterrolebinding node-ro-rb --clusterrole=node-ro --user=alice
kubectl auth can-i create deployments --as=system:serviceaccount:dev:app-sa -n dev
```

## 4. TLS CSR & Kubeconfig
```bash
openssl genrsa -out alice.key 2048
openssl req -new -key alice.key -out alice.csr -subj "/CN=alice/O=devs"
cat alice.csr | base64 | tr -d '\n'
# Tạo CSR YAML (signerName: kubernetes.io/kube-apiserver-client, usages: ["client auth"])
kubectl certificate approve alice-csr
kubectl get csr alice-csr -o jsonpath='{.status.certificate}' | base64 -d > alice.crt
kubectl config set-credentials alice --client-certificate=alice.crt --client-key=alice.key --embed-certs=true
kubectl config set-context alice-ctx --cluster=kubernetes --user=alice
kubeadm certs check-expiration && kubeadm certs renew all
```

## 5. Helm v3 & Kustomize
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update
helm install my-rel bitnami/nginx -n prod --create-namespace --set replicaCount=2
helm list -A
helm upgrade my-rel bitnami/nginx -n prod -f values.yaml
helm rollback my-rel 1 -n prod
helm uninstall my-rel -n prod

kubectl kustomize overlays/prod
kubectl apply -k overlays/prod
```

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
