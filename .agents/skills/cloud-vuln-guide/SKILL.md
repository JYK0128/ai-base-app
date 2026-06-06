---
name: cloud-vuln-guide
version: 1.0.0
author: JYK0128
license: CC BY 4.0 (KISA Checklist Reference)
description: 클라우드 취약점 점검 가이드(2024) 기반 보안 점검 및 결과 분석 스킬. 인프라(하이퍼바이저, 서버, DB, 웹서버, 컨테이너, 미들웨어, 스토리지, 네트워크 등) 취약점 가이드 및 분석 제공. 취약점 점검, 보안 점검, 하드닝, 설정 검토 요구사항 발생 시 사용.
---

# 클라우드 취약점 점검 가이드 (2024)

- 과학기술정보통신부·한국인터넷진흥원(KISA) 발행 **클라우드 취약점 점검 가이드(2024)** 기반의 보안 점검 수행
- 점검 대상 시스템에 부합하는 참조 파일 활용 및 점검 항목별 구체적인 보안 조치 가이드 제공

---

## 📋 문서 구조 개요

### 1장. 개요

- **1.1** 개요
- **1.2** 목적 및 활용
- **1.3** 유의사항
- 세부 사항: `references/01_overview.md` 참조

---

### 2장. 보안 가이드 (점검 대상별 분류)

- 점검 대상에 부합하는 카테고리의 참조 파일 로드 및 활용

| 카테고리 | 대상 시스템 | 참조 파일 |
| --- | --- | --- |
| 🖥️ 하이퍼바이저 | KVM, XenServer, ESXi, Hyper-V | `references/02_hypervisor.md` |
| 🐧 서버 | Linux, Windows | `references/03_server.md` |
| 💻 PC | Windows, MAC, Linux | `references/04_pc.md` |
| 🗄️ 데이터베이스 | MySQL, MS-SQL, Redis, Elasticsearch, MongoDB, PostgreSQL, Cubrid, CouchDB, SQLite, Tibero, InfluxDB, Oracle | `references/05_database.md` |
| 🌐 웹서버 / WAS | Apache, Nginx, IIS, Tomcat | `references/06_webserver.md` |
| 📦 컨테이너 / 가상화 인프라 | Docker, Kubernetes(Master/Worker), OpenStack | `references/07_container.md` |
| ⚙️ 미들웨어 / 런타임 | PHP, RabbitMQ, Node.js | `references/08_middleware.md` |
| 💾 분산 스토리지 / 빅데이터 | Ceph, Hadoop | `references/09_storage.md` |
| ☁️ PaaS 플랫폼 | BOSH(Director), BOSH(UAA) | `references/10_bosh.md` |
| 🔌 네트워크 장비 | Network Device | `references/11_network.md` |
| 🛡️ 정보보호시스템 | 방화벽, IPS, WAF 등 | `references/12_security_system.md` |
| 💿 스토리지 | SAN, NAS 등 | `references/13_storage_device.md` |

---

## 🔄 점검 워크플로우

1. **점검 대상 파악**:
   - 사용자로부터 점검 대상 시스템의 종류 확인 (예: "Docker 컨테이너 환경 점검 요청" -> 컨테이너 카테고리 선정)
2. **참조 파일 조회**:
   - 분류에 부합하는 참조 파일을 `view_file`로 로드함
   - 파일 크기가 클 경우, 목차(TOC)를 먼저 확인하고 필요한 섹션 위주로 탐색함
3. **점검 항목 제공**:
   - 각 점검 항목을 아래 규격화된 형식으로 제공함

     ```text
     ## [점검 항목 번호] 항목명
     - **위험도**: 상/중/하
     - **점검 내용**: 무엇을 확인하는지
     - **점검 방법**: 실행할 명령어 또는 확인 절차
     - **양호 기준**: 어떤 상태가 안전한지
     - **취약 기준**: 어떤 상태가 위험한지
     - **조치 방법**: 취약할 경우 조치 방법
     ```

4. **점검 결과 분석 (선택)**:
   - 사용자가 점검 결과(로그, 설정 파일, 명령어 출력 등)를 제시할 시 취약 여부 판정 및 맞춤형 조치 가이드 제공

---

## 📌 주요 원칙

1. **실제 점검 항목 기반**: 가이드 문서의 실제 점검 항목 번호와 내용을 기준으로 답변함
2. **버전·환경 고려**: 소프트웨어 버전에 따른 설정 경로 및 명령어 차이를 고려하여 사전에 사용자 환경 정보를 확인함
3. **위험도 우선 정렬**: 위험도 '상(High)' 항목을 우선적으로 정렬하여 안내함
4. **조치 전 검증 권고**: 운영 서비스 영향도 분석 및 조치 전 사전 검증을 필수적으로 권고함
5. **한국어 기본**: 가이드 및 분석 결과는 한국어를 기본으로 하되, 명령어와 기술 용어는 원문을 유지함

---

## 📚 원본 자료 (Source Documents)

- **상세 원문 파일**: `클라우드 취약점 점검 가이드(2024).pdf`
- **로컬 경로**: `resources/클라우드 취약점 점검 가이드(2024).pdf`
