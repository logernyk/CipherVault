// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title PhotoAlbum - 链上相册（单合约，FHE 同态计数 + 相册 NFT）
/// @notice 与 Zama 官方 FHEVM 用法保持一致：
///         - 前端 createEncryptedInput -> externalEuint32 + inputProof
///         - 合约 FHE.fromExternal 验证并导入为 euint32
///         - 使用 FHE.add 做同态累加
///         - 每次更新密文都对新句柄授权：FHE.allowThis(...) 与 FHE.allow(..., msg.sender)
contract PhotoAlbum is SepoliaConfig, ERC721 {
    using Strings for uint256;

    // -------------------------------
    // 数据结构
    // -------------------------------
    struct PhotoMeta {
        // 图片内容哈希（如 IPFS/Arweave 的 CID 哈希或图片本体 Keccak）
        bytes32 contentHash;
        // 元数据存储地址（如 IPFS JSON，包含名称/描述/缩略图等）
        string metadataURI;
        // 上传者
        address owner;
        // 上传时间
        uint64 timestamp;
    }

    struct AlbumMeta {
        string name;
        string description;
        uint64 createdAt;
        address owner;
        uint256[] photoIds;
        // 是否公开（仅作标记，访问控制交由前端/网关策略）
        bool isPublic;
    }

    // 用户侧「已上传图片数量」密文计数
    mapping(address => euint32) private _userPhotoCount;
    // 照片自增 ID
    uint256 private _nextPhotoId;
    // 相册自增 tokenId（即 NFT id）
    uint256 private _nextAlbumId;

    // 照片与相册存储
    mapping(uint256 => PhotoMeta) private _photos; // photoId => meta
    mapping(uint256 => AlbumMeta) private _albums; // albumId => meta

    // 相册 NFT：albumId == tokenId
    constructor() ERC721("PhotoAlbum", "PALB") {}

    // -------------------------------
    // 上传与存证（计数同态 + 明细上链）
    // -------------------------------
    /// @param contentHash 照片内容哈希（前端计算）
    /// @param metadataURI 照片元数据 URI（IPFS/Arweave）
    /// @param deltaEncrypted externalEuint32（通常为 1）
    /// @param inputProof 零知识证明
    function uploadPhoto(
        bytes32 contentHash,
        string calldata metadataURI,
        externalEuint32 deltaEncrypted,
        bytes calldata inputProof
    ) external {
        // 1) FHE 导入 + 同态累加
        euint32 delta = FHE.fromExternal(deltaEncrypted, inputProof);
        _userPhotoCount[msg.sender] = FHE.add(_userPhotoCount[msg.sender], delta);

        // 2) 授权最新句柄：合约自身与调用者
        FHE.allowThis(_userPhotoCount[msg.sender]);
        FHE.allow(_userPhotoCount[msg.sender], msg.sender);

        // 3) 记录图片元数据
        uint256 photoId = ++_nextPhotoId;
        _photos[photoId] = PhotoMeta({
            contentHash: contentHash,
            metadataURI: metadataURI,
            owner: msg.sender,
            timestamp: uint64(block.timestamp)
        });
    }

    // -------------------------------
    // 相册（NFT）
    // -------------------------------
    /// @notice 将多张图片打包为相册 NFT
    function mintAlbum(
        string calldata name,
        string calldata description,
        uint256[] calldata photoIds,
        bool isPublic
    ) external returns (uint256 tokenId) {
        require(photoIds.length > 0, "empty");
        tokenId = ++_nextAlbumId;
        _safeMint(msg.sender, tokenId);
        _albums[tokenId] = AlbumMeta({
            name: name,
            description: description,
            createdAt: uint64(block.timestamp),
            owner: msg.sender,
            photoIds: photoIds,
            isPublic: isPublic
        });
    }

    /// @notice 设置相册公开/私密
    function setAlbumPublic(uint256 tokenId, bool isPublic) external {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        _albums[tokenId].isPublic = isPublic;
    }

    // -------------------------------
    // 只读接口
    // -------------------------------
    function getEncryptedUploadCount(address user) external view returns (euint32) {
        return _userPhotoCount[user];
    }

    function getPhoto(uint256 photoId) external view returns (PhotoMeta memory) {
        return _photos[photoId];
    }

    function getAlbum(uint256 tokenId) external view returns (AlbumMeta memory) {
        return _albums[tokenId];
    }
}


